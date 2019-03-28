// Vamos criar um novo elemento de uma forma muito frequente dentro desse código, então criamos uma função especialmente para isso e logo depois vamos aplicar um classe CSS para esse elemento

function novoElemento(tagName, className) {
    const elem = document.createElement(tagName) // criando um novo elemento com a tag que foi passada no parâmetro

    elem.className = className // atribuindo a classe a esse novo elemento (mesma função do "classList")

    return elem
}

/* Função CONSTRUTORA que vai criar uma barreira (reversa = false: se a barreira vai ser reversa (ou seja, a barreira de cima que tem o corpo e depois a borda) ou uma barreira normal (a barreira que fica no chão) ) e encima desse parâmetro vamos definir quem adicionar primeiro, se é a borda e o corpo (barreira no chão) ou se primeiro vem o corpo e depois a borda (barreira de cima). NESTE CASO, reversa = false QUER DIZER QUE É UMA BARREIRA NORMAL (CHÃO)*/

/* RELEMBRANDO: quando usamos o "this" dentro de uma função construtora aquele atributo passa a ser visível fora da função */

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    // false = barreira do chão | true  =  barreira de cima

    this.elemento.appendChild(reversa ? corpo : borda) // se reversa = true: aplique "corpo" primeiro | false: aplique a "borda" primeiro

    this.elemento.appendChild(reversa ? borda : corpo) // 2º cahamada. se reversa = true: aplique a "borda" primeiro | false: aplique o "corpo" primeiro

    // função para alterar aleatoriamente a altura da barreira

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// TESTE
// const b = new Barreira(false) /* ou "true" */
// b.setAltura(200)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

/* Outra FUNÇÃO CONSTRUTORA ParDeBarreiras */

// (altura = altura DO JOGO, DA TELA, abertura = a abertura que queremos entre uma barreira e outra, x = a posição que queremos colocar esse par de barreiras)

/* RELEMBRANDO: quando usamos o "this" dentro de uma função construtora aquele atributo passa a ser visível fora da função */

function ParDeBarreiras(altura, abertura, x) {
    this.elementoDivPar = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true) 
    this.inferior = new Barreira(false)

    this.elementoDivPar.appendChild(this.superior.elemento) // this.superior.elemento = this.superior que instanciamos é igual a um "new Barreira(true)" (que é uma função construtora) logo, this.superior vai ter acesso aos elemento dessa função que retorna uma barreira(elemento, no caso, com o reversa = true)

    this.elementoDivPar.appendChild(this.inferior.elemento) // mesma lógica acima, porém agora com o this.inferior (barreira do chão)

    /* função que vai sortear aleatoriamente a abertura entre as duas barreiras */

    // A abertura vai ser fixa, sendo assim, vamos calcular de forma aleatória um dos lados e o outro lado vamos calcular subtraindo a altura de um dos lados menos a abertura

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura) // relembrando: Math.radom() dá um resultado de 0 até 1 | altura = no caso este parâmetro "altura" se refere a altura do jogo
        const alturaInferior = altura - abertura - alturaSuperior

        // lembresse: superior/inferior foi criado pelo "new Barreira(true/false)", tendo assim, acesso a função "SetAltura" que foi criada com "this"

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    // queremos em alguns momentos saber em que posição o par de barreiras está (pegando a posição atual)

    this.getX = () => parseInt(this.elementoDivPar.style.left.split('px')[0]) // pegando o left e dividndo sua string usando de referência o 'px' e pegando o índice 0 (ou seja, o que vem antes de 'px' que vai ser o número) e passando esse resultado para um Inteiro

    // também temos que em vários momentos mudar a posição do par de barreiras, para que assim possamos animar o jogo indo para frente (alterando o x qu foi passado)
        
    this.setX = x => this.elementoDivPar.style.left = `${x}px`

    // precisamos também saber a largura do elemento

    this.getLargura = () => this.elementoDivPar.clientWidth

    // Já recebemos o 'x' como parâmetro a essa altura do campeonato, então antes de terminar essa função nós vamos calcular/sortear a primeira abertura e também setar o 'x' que recebemos como parâmetro

    this.sortearAbertura()  // chamando a função!
    this.setX(x)  // chamando a função!
}

// TESTE
// const c = new ParDeBarreiras(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(c.elementoDivPar)

/* FUNÇÃO CONSTRUTORA Barreiras */

// parâmetros: altura = altura do jogo, da tela | largura = largura do jogo, da tela | abertura = espaço entre as barreiras(barreira de cima e a de baixo) | espaco = espaço entre os pares de barreiras (ParDeBarreiras) | notificarPonto = vai ser uma CALLBACK disparada quando uma determinada barreira passar/cruzar pelo meio do jogo, o centro do jogo, pois já que o passarinho vai sempre estar no centro do jogo, no momento que uma barreira cruza o centro 1 ponto vai ser contabilizado

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura), // largura vai ser a largura inicial da barreira (isso quer dizer que a primeira e as demais barriras vão começar lá fora da tela)
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3 // de quanto em quanto as barreiras vão andar

    // this.animar = vai ser a função responsável por dar um passo na animação e depois lá fora do jogo vamos controlar isso dentro de um time para fazer a animação tanto do pássaro quanto da animação das barreiras e a checagem de colisão

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da área do jogo
            if(par.getX() < -par.getLargura()) {

                par.setX(par.getX() + espaco * this.pares.length) // mandamos o par de barreira lá para o final adicionando o resultado desta vonta no 'left' do elemento(par de barreira)

                par.sortearAbertura() // e agora com ela novamente no final, sorteamos uma nova abertura para a barreira
            }
            
            // cálculo para quando um determino par de barreira barreira cruzar o meio da tela

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouOMeio) notificarPonto() // se essa variável for verdadeira, vai executar o notificarPonto()
        })
    }
}

/* CRIAÇÃO DO PÁSSARO */

function Passaro(alturaJogo) {
    let voando = false

    this.elementoPassaro = novoElemento('img', 'passaro')
    this.elementoPassaro.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elementoPassaro.style.bottom.split('px')) // saber exatamente a posição que o pássaro está voando (detalhe: Y = eixo vertical, por isso criamos o nome da função assim, para ficar sinalizado)

    this.setY = y => this.elementoPassaro.style.bottom = `${y}px` // setando a altura do pássaro para fazer sua animação

    // onkeydowm = Este evento significa que quando o usuário clicar em qualquer tecla e/ou estiver pressionada
    // onkeyup = quando o usuário solta a tecla

    window.onkeydown = e => voando = true // quando o usuário pressionar qualquer tecla vai sertar voando para "true"
    window.onkeyup = e => voando = false // quando o usuário soltar a tecla, voando vai ser "false"

    // this.animar = função que vai manipular a altura do pássaro

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)

        const alturaMaxima = alturaJogo - this.elementoPassaro.clientHeight // para o pássaro não sair da tela

        // definindo altura mínima para não passar do chão
        if (novoY <= 0) {
            this.setY(0) // no máximo se bottom vai chegar a zero, fazendo assim não passar/sair do chão

        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima) // no máximo vai chegar até o teto, não ultrapassando disso

        } else {
            this.setY(novoY) // e se o novoY não violar nem a altura mínima e nem a altura máxima ai sim nós setamos a posição para que ele fique entre eles, na tela do jogo
        }
    }

    // defininado a posição inicial do pássaro
    this.setY(alturaJogo / 2)
}

/* DEFININDO A PARTE DE PROGRESSO (pontuação) */

function Progresso() {
    this.elementoProgresso = novoElemento('span', 'progresso') // primeiramente vamos criar o objeto que vai exibir os pontos

    this.atualizarPontos = pontos => {
        this.elementoProgresso.innerHTML = pontos
    }

    this.atualizarPontos(0) // definindo o ponto inicial
}

// TESTE: Segundo o professor, nós vamos criar uma função construtora para representar isso, para representar o jogo

// const barreiras = new Barreiras(700, 1200, 200, 460)
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')

// areaDoJogo.appendChild(passaro.elementoPassaro)
// areaDoJogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elementoDivPar))

// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)

/* FUNÇÃO PARA REPRESENTAR O JOGO */

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    // Criando os elementos

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos)) // estamos incrementando a variável antes mesmo de passar para a função. Netão incrementamos, passamos para a função e de quebra ainda atualizamos o "let pontos" criado aqui
    const passaro = new Passaro(altura)

    // Adicionando os elementos na tela do jogo

    areaDoJogo.appendChild(progresso.elementoProgresso)
    areaDoJogo.appendChild(passaro.elementoPassaro)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elementoDivPar))

    // função para iniciar o jogo (vamos ter o loop do jogo em cima de um temporizador. Vamos colocar esse temporizador dentro de uma constante pois quando houver uma colisão nós vamos para-lo)

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
            }

        }, 20)
    }
}

new FlappyBird().start()

/* PROGRAMANDO A COLISÃO */

// Vamos criar uma função que vai checar a colizão de uma forma genérica, então quando houver sobreposiçâo entre 2 elementos significa que houve a colisão. O importante é que para haver colisão, precisamos que tenha tanto no eixo vertical quanto no horizontal

function estaoSobrepostos(elementoA, elementoB) {
    // em cima do elementoA e do elementoB vamos pegar o retângulo associado a esse lemento para que tenhamos as dimensões desse elemento e consiga fazer as validações para saber se eles estão sobrepostos ou não

    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    // 1º teste - Se há ou não sobreposição horizontal (ex: estamos empre nos basiando peloe suqerda da ela então a.left + a.width somados significa exatamente a DIREITA do elemento "a" pois é a distância à esquerda mais a largura do objeto [este é só um EXEMPLO da primeira expressão, para que assim possamos entender o que está acontecendo])

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left

    // 2º teste - se há ou não sobreposição vertical

    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    // Agora, se houver colisão tanto horizontal como vertical o resultado do método/função "estaoSobrepostos" vai dar verdaddeiro

    return horizontal && vertical
}

/* CRIANDO A FUNÇÃO QUE DE FATO VAI TESTAR A COLISÃO ENTRE O PÁSSARO E AS BARREIRAS */

function colidiu(passaro, barreiras) {
    let colidiu = false

    barreiras.pares.forEach(parDeBarreiras => {

        // só entra caso "false"
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento

            colidiu = estaoSobrepostos(passaro.elementoPassaro, superior) || estaoSobrepostos(passaro.elementoPassaro, inferior) // caso "true", não entra mais no loop e retorna "true"
        }
    })

    return colidiu
}