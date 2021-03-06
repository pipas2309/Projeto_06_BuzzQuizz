// VARIÁVEIS GLOBAIS
const API = "https://mock-api.driven.com.br/api/v6/buzzquizz/quizzes";
let qualPagina = "";
let idQuizz = "";
let primeiroAcesso = 0;
let perguntas;
let niveis;
let recarregar;
let idQuizzCriado;
let idsQuizzes = [];
let keyQuizzCriado;
let ahapagar = false;

// Função que retorna pra home no logo
function retornaHome(){
    document.location.reload(true)
}
//Função que carrega página principal

if(primeiroAcesso === 0) {
    carregarPagina("home");
    primeiroAcesso = 1;
}

function carregarPagina(pagina) {
    document.querySelector(".tela-um").classList.add("escondido");
    document.querySelector(".tela-dois").classList.add("escondido");
    document.querySelector(".tela-tres").classList.add("escondido");
    document.querySelector(".carregando").classList.remove("escondido");

    const promisse = axios.get(API);
    promisse.then(renderizarQuizzes);
    qualPagina = pagina;
    
}


//Renderiza os quizzes da COMUNIDADE
function renderizarQuizzes(el) {
    const array = el.data;
    console.log(el.data)
    const containerComunidade = document.querySelector(".container-comunidade");
    const containerUsuario = document.querySelector(".usuario");
    const usuarioQuizz = document.querySelector(".container-usuario")
    containerComunidade.innerHTML = "";
    
    for(let i = 0; i < array.length; i++) {
        containerComunidade.innerHTML += `
        <div class="quizz-comunidade" id="${array[i].id}" onclick="selecionarQuizz(this)" title="${array[i].title}">
            <img src="${array[i].image}" alt="Imagem do Quizz: ${array[i].title}">
            <p>${array[i].title}</p>
        </div>
        `;
    }

    if(localStorage.length == 0){
        containerUsuario.innerHTML= ""
        containerUsuario.innerHTML += `
        <div class="container-usuario-vazio">
            <div class="quizz-usuario-vazio">
                <div class="vazio">
                    <p>Você não criou nenhum quizz ainda :(</p>
                    <button onclick="criarQuizz()">Criar Quizz</button>
                </div>
            </div>
        </div>`
    }

    if(localStorage.length != 0){
        containerUsuario.innerHTML= ""
        containerUsuario.innerHTML += `
        <div class="usuario-localStorage">
            <div class="info-usuario ">
                <h2>Seus Quizzes</h2> 
                <button onclick="criarQuizz()">+</button>
            </div>
            <div class="container-usuario ">
            </div>
        </div>   
        `;

        //renderiza os quizzes
        let quizz = localStorage.getItem("ListaQuizz");
        quizz = JSON.parse(quizz);
        for(let i = 0; i < quizz.length; i++) {

            const quizzesDoUsuario = axios.get(`https://mock-api.driven.com.br/api/v6/buzzquizz/quizzes/${quizz[i]}`).then(response=>{
            const image = response.data.image;
            const title = response.data.title;
            const id = response.data.id;
            const meuquizz = document.querySelector(".container-usuario");
            meuquizz.innerHTML += `
                <div class="quizz-usuario" id="${id}" onclick="selecionarQuizz(this)" title="${title}">
                    <img src=${image} alt="Imagem: ${title}">
                    <p>${title}</p>
                    <ion-icon class="editar" name="create-outline" onclick="editar(${id})" role="img" aria-label="create outline"></ion-icon>
                    <ion-icon class="deletar" name="trash-outline" onclick="apagar(${id})" role="img" aria-label="trash outline" title="Deletar"></ion-icon>
                </div>
            `;
        })
        }
    }
        
    

    if(qualPagina === "home") {
        document.querySelector(".tela-um").classList.remove("escondido");
        document.querySelector(".carregando").classList.add("escondido");
        if(document.querySelector(".tela-tres-sucesso-quizz")) {
            document.querySelector(".tela-tres-sucesso-quizz").classList.add("escondido");
        }
    }
}

function selecionarQuizz(el) {
    if(ahapagar) {
        ahapagar = false;
        return;
    }
    idQuizz = el.id;
    qualPagina = "tela-dois";
    carregarQuizz();
}

function carregarQuizz() {
    document.querySelector(".tela-um").classList.add("escondido");
    document.querySelector(".tela-dois").classList.add("escondido");
    document.querySelector(".tela-tres").classList.add("escondido");
    document.querySelector(".carregando").classList.remove("escondido");

    const promisse = axios.get(`${API}/${idQuizz}`);
    promisse.then(renderizarQuizzSelecionado);
}

function renderizarQuizzSelecionado (el) {
    recarregar = el;
    const quizz = el.data;
    const containerQuizz = document.querySelector(".tela-dois");
    nivel = quizz.levels;
    perguntas = quizz.questions.length;

    containerQuizz.innerHTML = `
    <div class="banner">
        <img src="${quizz.image}" alt="Imagem do Quizz: ${quizz.title}">
        <h3>${quizz.title}</h3>
    </div>
    `;
    for(let i = 0; i < perguntas; i++) {
        containerQuizz.innerHTML += `
        <div class="container-questao">
            <div class="questao q${i}">
                <div class="pergunta" style="background-color:${quizz.questions[i].color}"><h4>${quizz.questions[i].title}</h4></div>
            </div>
        </div>
        `;
    }
    for(let i = 0; i < perguntas; i++) {
        const resposta = embaralhar(quizz.questions[i].answers);
        for(let j = 0; j < resposta.length; j++) {
            document.querySelector(`.q${i}`).innerHTML += `
            <div class="resposta reagir" onclick="validarResposta(this)">
                <img src="${resposta[j].image}" id="${resposta[j].isCorrectAnswer}" alt="Imagem: ${resposta[j].text}"/>
                <p>${resposta[j].text}</p>
            </div>
            `;
        }
    }
    if(qualPagina === "tela-dois") {
        document.querySelector(".tela-dois").classList.remove("escondido");
        document.querySelector(".carregando").classList.add("escondido");
    }
}

function enviaQuizz() {
    const promisse = axios.post(API, novoQuizz);

    document.querySelector(".carregando").classList.remove("escondido");
    document.querySelector(".tela-tres-niveis-quizz").classList.add("escondido");

    promisse.then(carregarFinalizacao);
}

function carregarFinalizacao(el) {
    idQuizzCriado = el.data.id;
    keyQuizzCriado = el.data.key
    const promisse = axios.get(`${API}/${idQuizzCriado}`);
    promisse.then(renderizaFinalizacao);
}

function renderizaFinalizacao(el) {
    salvaLocal();
    const quizz = el.data;
    console.log(el)
    console.log(el.data)
    document.querySelector(".sucesso-quizz").innerHTML = `
    <div class="gradiente"><p>${quizz.title}?</p></div>
    <img src="${quizz.image}" alt="Imagem: ${quizz.title}"/>
    `;

    document.querySelector(".carregando").classList.add("escondido");
    document.querySelector(".tela-tres-sucesso-quizz").classList.remove("escondido");
}

function embaralhar(array) {
    let ordemPadrao = array.length; 
    let ordemAleatoria;
  
    // para quando acabar os elementos para embaralhar
    while (ordemPadrao != 0) {
  
      // deixa aleatório
      ordemAleatoria = Math.floor(Math.random() * ordemPadrao);
      ordemPadrao--;
  
      [array[ordemPadrao], array[ordemAleatoria]] = [
        array[ordemAleatoria], array[ordemPadrao]];
    }
  
    return array;
  }

function retiraRespostaVazia() {
    let array = [];

    for(let i = 0; i < qntPerguntasQuizz; i++) {
        array = novoQuizz.questions[i].answers;
        let textoR3 = Boolean(array[2].text);
        let imagemR3 = Boolean(array[2].image);
        let textoR4 = Boolean(array[3].text);
        let imagemR4 = Boolean(array[3].image);
        let cortei = false;

        if(!textoR3 || !imagemR3) {
            array.splice(2, 1);
            cortei = true;
        }
        if(cortei) {
            if(!textoR4 || !imagemR4) {
                array.splice(2, 1);
            }
        } else if(!textoR4 || !imagemR4) {
                array.splice(3, 1);
        }
        
    }
    console.log(array + " acabou");
}

function salvaLocal() {
    //Lista com os IDs dos Quizzes que você criou
    let idLista = [];
    let keyLista = []

    //Cria/Atualiza a lista de IDs com seus quizz no LOCAL STORAGE
    if(localStorage.getItem("ListaQuizz")) {
        //Se a lista já existe:

        //Pega a lista
        let listaString = localStorage.getItem("ListaQuizz");
        let keyString = localStorage.getItem("Keys");
        //Transforma em array
        let lista = JSON.parse(listaString);
        let key = JSON.parse(keyString);
        //Acrescenta o novo id
        lista.push(idQuizzCriado);
        key.push(keyQuizzCriado);
        //Salva a lista numa variável
        idLista = lista;
        keyLista = key;
        //Converte a nova lista em string
        listaString = JSON.stringify(lista);
        keyString = JSON.stringify(key);
        //Salva no local storage
        localStorage.setItem("ListaQuizz", listaString);
        localStorage.setItem("Keys", keyString);
    } else {
        //Se a lista não existe

        //Salva o novo ID e KEY na lista
        idLista.push(idQuizzCriado)
        keyLista.push(keyQuizzCriado)
        //Converte em String
        const idListaString = JSON.stringify(idLista);
        const keyListaString = JSON.stringify(keyLista);
        //Salva no local storage
        localStorage.setItem("ListaQuizz", idListaString);
        localStorage.setItem("Keys", keyListaString);
        console.log(idLista)
    }

    //Guarda seu Quizz no local storage

    //Transforma o Quizz de OBJETO para STRING
    const quizzString = JSON.stringify(novoQuizz);
    //Salva o novo quizz como STRING usando o buscador que é o seu ID
    localStorage.setItem(idQuizzCriado, quizzString);

}

function editar() {

}

function apagar(ID) {
    ahapagar = true;
    const deletar = axios.get(`${API}/${ID}`);
    let quizzParaDeletar;
    deletar.then(function(el){
        quizzParaDeletar = el.data;
    })
    console.log(ID)
    let dadosQuizz = localStorage.getItem(ID);
    dadosQuizz = JSON.parse(dadosQuizz)
    let confirmaDeletar = confirm(`Tem certeza que quer deletar o quizz ${dadosQuizz.title}`);

    if(confirmaDeletar) {
        let ids = localStorage.getItem("ListaQuizz");
        ids = JSON.parse(ids);
        let posicao = ids.indexOf(ID);
        let key = localStorage.getItem("Keys");
        key = JSON.parse(key);
        const deletando = axios.delete(`${API}/${ID}`,{headers: { "Secret-Key": key[posicao]}});
        ids.splice(posicao,1);
        key.splice(posicao,1);
        ids = JSON.stringify(ids);
        key = JSON.stringify(key);
        localStorage.setItem("Keys",key);
        localStorage.setItem("ListaQuizz",ids);
        localStorage.removeItem(ID);
        deletando.then(carregarPagina("home"))
    }

    let local = localStorage.getItem("ListaQuizz");
    if(local === "[]") {
        localStorage.removeItem("ListaQuizz");
        localStorage.removeItem("Keys");
    }
}