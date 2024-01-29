import util from 'util'
import child_process from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import dedent from 'dedent'

const execp = util.promisify(child_process.exec)

interface Executable {
    execute(input: string): Promise<string>
    uninstall(): Promise<void>
}

async function prepare_executable(code: string): Promise<Executable> {
    const tmp_dir = await fs.mkdtemp(path.join(os.tmpdir(), 'generz-tests-'))
    const gen_path = path.join(tmp_dir, 'gen.erz')
    const out_path = path.join(tmp_dir, 'out.ts')

    await fs.writeFile(gen_path, code)
    await execp(`node ./dist/main.js -o ${out_path} ${gen_path}`)

    const main_path = path.join(tmp_dir, 'main.ts')

    await fs.writeFile(main_path, dedent`
        import { readFileSync } from 'fs'
        import { parse } from './out'
        
        try {
            const input = readFileSync(process.stdin.fd, 'utf-8')
            const codes = Array.from(input).map(x => x.charCodeAt(0))
            parse(codes)
        } catch (err: any) {
            console.log(err.message)
        }
    `)
    
    return {
        execute(input: string): Promise<string> {
            return new Promise<string>((accept, reject) => {
                const process = child_process.exec(`node ./node_modules/ts-node/dist/bin.js ${main_path}`, (err, stdout, _stderr) => {
                    if (err)
                        return reject(err)

                    accept(stdout)
                })

                process.stdin?.write(input)
                process.stdin?.end()
            })
        },
        uninstall(): Promise<void> {
            return fs.rm(tmp_dir, {recursive: true, force: true})
        }
    }
}

test('EOF', async () => {
    const executable = await prepare_executable(dedent`
        terminal a
        
        variable A {
            production a
        }
    `)

    expect(await executable.execute('aa')).toMatch(/EOF expected/)
    await executable.uninstall()
})

describe('binary', () => {
    let executable: Executable|undefined

    beforeAll(async () => {
        executable = await prepare_executable(dedent`
            delimiter /\s+/
            terminal zero /0/
            terminal one /1/

            variable XExt {
                production zero XExt
                production one XExt
                epsilon
            }

            variable X {
                production zero XExt
                production one XExt
            }
        `)
    })
    
    afterAll(() => executable?.uninstall())

    test('empty', async () => {
        expect(await executable?.execute('')).toMatch(/expected.+terminal.+but found/)
    })

    test('just-zeros', async () => {
        expect(await executable?.execute('0000')).toBe('')
    })

    test('just-ones', async () => {
        expect(await executable?.execute('1111')).toBe('')
    })

    test('mixed', async () => {
        expect(await executable?.execute('0010101110101')).toBe('')
    })

    test('whitespaces', async () => {
        expect(await executable?.execute('00101\n01\r110\t10 1')).toBe('')
    })

    test('wrong', async () => {
        expect(await executable?.execute('2')).toMatch(/expected.+terminal.+but found/)
    })
})

describe('numexp', () => {
    let executable: Executable|undefined

    beforeAll(async () => {
        executable = await prepare_executable(dedent`
            delimiter /\s+/
            terminal number /[0-9]+/
            terminal plus /\+/
            terminal minus /\-/

            variable XExt {
                production plus number XExt
                production minus number XExt
                epsilon
            }

            variable X {
                production number XExt
            }
        `)
    })
    
    afterAll(() => executable?.uninstall())

    const good_ones = [
        '4 + 2',
        '1-2',
        '11',
        '123 + 19 - 1',
        ' 1+2'
    ]

    for (const query of good_ones) {
        test(query.replaceAll(' ', ''), async () => {
            expect(await executable?.execute(query)).toBe('')
        })
    }

    test('5+-1', async () => {
        expect(await executable?.execute('5 + -1')).toMatch(/expected.+terminal.+number.+but found.+\-/)
    })

    test('5+xyz', async () => {
        expect(await executable?.execute('5 + xyz')).toMatch(/expected.+terminal.+number.+but found.+x/)
    })
})
