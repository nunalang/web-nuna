let STOP = false

const codeElem   = document.getElementsByName('code')[0]
const outputElem = document.getElementsByName('output')[0]
const dumpsElem  = document.getElementsByName('dumps')[0]

const runElem   = document.getElementsByName('run')[0]
const stopElem  = document.getElementsByName('stop')[0]
const clearElem = document.getElementsByName('clear')[0]
const resetElem = document.getElementsByName('reset')[0]

const speedElem = document.getElementsByName('speed')[0]
const splabelElem = document.getElementsByName('splabel')[0]

splabelElem.innerText = '실행 속도: ' + speedElem.value + 'ms당 1스텝'

runElem.onclick   = () => run(codeElem.value)
stopElem.onclick  = () => STOP = true
clearElem.onclick = () => { outputElem.value = ''; dumpsElem.value = '' }
resetElem.onclick = () => codeElem.value = ''
speedElem.oninput = () => splabelElem.innerText = '실행 속도: ' + speedElem.value + 'ms당 1스텝'

function run (code) {
  STOP = false
  outputElem.value = ''
  runElem.disabled = true
  speedElem.disabled = true
  outputElem.style.borderColor = ''

  const raw = code.trim()
  if (raw.includes('\u2665')) {
    printOut('[!] Fatal: 내부문자 "\u2665"는 사용할 수 없습니다')
    return stop()
  }

  const statements = raw.replace(/\ud83d\udc95/g, '\u2665').split('')
  const variables = []
  let pointer = 0
  let recentCreated = -1

  const interval = setInterval(() => {
    if (STOP) { STOP = false; stop() }
  
    const statement = statements[pointer++]
    if (!statement) return stop()

    const fatal = execute(statement)
    if (fatal) return stop()

    dumpsElem.value =
      'Variables:\n' + variables.reduce((prev, curr, i) => prev + ((i === recentCreated ? '>' : ' ') + i++ + '. ' + (curr || '')) + '\n', '') +
      '\n\nStatement: (' + pointer + '/' + statements.length + ')\n' + (statements[pointer] || '')
  }, speedElem.value)

  function execute (char) {
    switch (char) {
      // 스택 생성
      case '눈':
      case '누': {
        recentCreated = variables.push(1) - 1
        break
      }

      // 곱
      case '난':
      case '나': {
        const many = getMany()
        variables[recentCreated] *= (many || 1)
        break
      }

      // 차
      case '죽':
      case '주': {
        const many = getMany()
        variables[recentCreated] -= (many || 1)
        break
      }

      // 합
      case '거': {
        const many = getMany()
        variables[recentCreated] += (many || 1)
        break
      }

      // 스택 Pop
      case '헤': {
        variables.splice(recentCreated)
        recentCreated = recentCreated - 1 < 0 ? 0 : recentCreated - 1
        break
      }

      // 스택 빼기
      case '응': {
        const prev = variables[recentCreated - 1] || 0
        if (variables[recentCreated - 1] !== undefined)
          variables[recentCreated - 1] = null

        variables[recentCreated] -= prev
        break
      }

      // 거듭제곱
      case '흐': {
        const many = getMany()
        if (statements[pointer + many] !== '읏') {
          printOut('[!] Fatal: "흐"로 시작하는 Operation은 "읏"으로 끝나야 합니다')
          return 1
        }

        variables[recentCreated] **= (many || 1)
        break
      }

      // 스택 합치기
      case '\u2665': {
        const prev = variables[recentCreated - 1] || 0
        if (variables[recentCreated - 1] !== undefined)
          variables[recentCreated - 1] = null

        variables[recentCreated] += prev
        break
      }

      // 출력
      case '!': {
        printOut(String.fromCharCode(variables[recentCreated] ))
        break
      }

      // Special characters
      case '.':
      case '으': { break }

      // Escapes
      case '\n':
      case '\r': { break }

      default: {
        printOut(`[!] Fatal: 문자 "${char}"을 인식할 수 없습니다`)
        return 1
      }
    }

    return 0
  }

  function getMany () {
    let many = 0
    while (true) {
      if (statements[pointer] === '.') many++
      else if (statements[pointer] === '으') many += variables[recentCreated - 1] || 0
      else break
      pointer++
    }
    return many
  }

  function printOut (str) {
    outputElem.value += str
    outputElem.scrollTo(0, 9999)
  }

  function stop () {
    runElem.disabled = false
    speedElem.disabled = false
    clearInterval(interval)
  }
}
