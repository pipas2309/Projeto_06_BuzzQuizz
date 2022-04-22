// VARIÁVEIS GLOBAIS
const API = "https://mock-api.driven.com.br/api/v6/buzzquizz/quizzes";
let qualPagina = "";
let idQuizz = "";
let primeiroAcesso = 0;

//Função que carrega página principal

if(primeiroAcesso === 0) {
    carregarPagina("home");
    primeiroAcesso = 1;
}

function carregarPagina (pagina) {
    document.querySelector(".tela-um").classList.add("escondido");
    document.querySelector(".tela-dois").classList.add("escondido");
    document.querySelector(".tela-tres").classList.add("escondido");
    document.querySelector(".carregando").classList.remove("escondido");

    const promisse = axios.get(API);
    promisse.then(renderizarQuizzes);
    qualPagina = pagina;
}


//Renderiza os quizzes da COMUNIDADE
function renderizarQuizzes (el) {
    const array = el.data;
    const containerComunidade = document.querySelector(".container-comunidade");
    const containerUsuario = document.querySelector(".container-usuario");

    // console.log(array.length);
    // console.log(el);
    // console.log(el.data[1]);
    // console.log(el.data[1].id);
    // console.log(el.data[1].image);
    // console.log(el.data[1].levels);
    // console.log(el.data[1].questions);
    // console.log(el.data[1].title);

    for(let i = 0; i < array.length; i++) {
        containerComunidade.innerHTML += `
        <div class="quizz-comunidade" id="${array[i].id}" onclick="selecionarQuizz(this)" title="${array[i].title}">
            <img src="${array[i].image}" alt="Imagem do Quizz: ${array[i].title}">
            <p>${array[i].title}</p>
        </div>
        `
    }

    if(qualPagina === "home") {
        document.querySelector(".tela-um").classList.remove("escondido");
        document.querySelector(".carregando").classList.add("escondido");
    }
}

function selecionarQuizz(el) {
    idQuizz = el.id;
    qualPagina = "tela-dois";
    carregarQuizz();
}

function carregarQuizz () {
    document.querySelector(".tela-um").classList.add("escondido");
    document.querySelector(".tela-dois").classList.add("escondido");
    document.querySelector(".tela-tres").classList.add("escondido");
    document.querySelector(".carregando").classList.remove("escondido");

    const promisse = axios.get(`${API}/${idQuizz}`);
    promisse.then(renderizarQuizzSelecionado);
}

function renderizarQuizzSelecionado (el) {
    const quizz = el.data;
    const containerQuizz = document.querySelector(".tela-dois");
    const niveis = quizz.levels.length;
    const perguntas = quizz.questions.length;
    
    console.log(quizz)

    containerQuizz.innerHTML = `
    <div class="banner">
        <img src="${quizz.image}" alt="Imagem do Quizz: ${quizz.title}">
        <p>${quizz.title}</p>
    </div>
    `
    for(let i = 0; i < perguntas; i++) {
        containerQuizz.innerHTML += `
        <div class="container-questao">
            <div class="questao q${i}">
                <div class="pergunta" style="color:${quizz.questions[i].color}"><p>${quizz.questions[i].title}</p></div>
            </div>
        </div>
        `
    }
    for(let i = 0; i < perguntas; i++) {
        const resposta = quizz.questions[i].answers
        for(let j = 0; j < resposta.length; j++) {
            document.querySelector(`.q${i}`).innerHTML += `
            <div class="resposta">
                <img src="${resposta[j].image}" id="${resposta[j].isCorrectAnswer}" alt="Imagem: ${resposta[j].text}"/>
                <p>${resposta[j].text}</p>
            </div>
            `
        }
    }
    for(let i = 0; i < niveis; i++) {
        
    }


    if(qualPagina === "tela-dois") {
        document.querySelector(".tela-dois").classList.remove("escondido");
        document.querySelector(".carregando").classList.add("escondido");
    }
}