const textoInput = document.getElementById('texto');
const vozesSelect = document.getElementById('vozes');
const velocidadeInput = document.getElementById('velocidade');
const valVelocidade = document.getElementById('valVelocidade');

const btnPlay = document.getElementById('btnPlay');
const btnPause = document.getElementById('btnPause');
const btnStop = document.getElementById('btnStop');
const btnClear = document.getElementById('btnClear');

if (!('speechSynthesis' in window)) {
    alert('Seu navegador não suporta leitura em voz.');
} else {
    const synth = window.speechSynthesis;
    let vozes = [];
    let leituraId = 0;
    let inicioLeituraTimer;

    function cancelarLeitura() {
        leituraId++;
        clearTimeout(inicioLeituraTimer);
        inicioLeituraTimer = null;
        synth.cancel();
    }

    function carregarVozes() {
        const vozAnterior = obterVozSelecionada();
        vozes = synth.getVoices();
        vozesSelect.innerHTML = '';

        if (vozes.length === 0) {
            vozesSelect.innerHTML = '<option value="">Nenhuma voz disponível</option>';
            return;
        }

        const indiceAnterior = vozAnterior
            ? vozes.findIndex(voz => voz.voiceURI === vozAnterior.voiceURI)
            : -1;
        const indicePortuguesBrasil = vozes.findIndex(voz => voz.lang.toLowerCase() === 'pt-br');
        const indicePortugues = vozes.findIndex(voz => voz.lang.toLowerCase().startsWith('pt'));
        const indiceSelecionado = [indiceAnterior, indicePortuguesBrasil, indicePortugues, 0]
            .find(indice => indice >= 0);

        vozes.forEach((voz, index) => {
            const option = document.createElement('option');
            option.textContent = `${voz.name} (${voz.lang})`;
            option.value = String(index);
            option.selected = index === indiceSelecionado;

            vozesSelect.appendChild(option);
        });
    }

    function atualizarVelocidade() {
        valVelocidade.textContent = `${velocidadeInput.value}x`;
    }

    function obterVozSelecionada() {
        const indice = Number(vozesSelect.value);
        return vozes[indice] || null;
    }

    function falarTexto() {
        const texto = textoInput.value.trim();

        if (!texto) {
            alert('Digite algo no campo de texto antes de ouvir.');
            return;
        }

        cancelarLeitura();

        const utterance = new SpeechSynthesisUtterance(texto);
        const voz = obterVozSelecionada();

        if (voz) {
            utterance.voice = voz;
        }
        utterance.lang = voz?.lang || document.documentElement.lang || 'pt-BR';

        utterance.rate = Number(velocidadeInput.value);
        const idAtual = leituraId;

        inicioLeituraTimer = setTimeout(() => {
            if (idAtual !== leituraId) {
                return;
            }

            synth.speak(utterance);
            inicioLeituraTimer = null;
        }, 100);
    }

    btnPlay.addEventListener('click', falarTexto);

    btnPause.addEventListener('click', () => {
        if (synth.speaking && !synth.paused) {
            synth.pause();
        }
    });

    btnStop.addEventListener('click', () => {
        cancelarLeitura();
    });

    btnClear.addEventListener('click', () => {
        textoInput.value = '';
        cancelarLeitura();
    });

    velocidadeInput.addEventListener('input', atualizarVelocidade);
    atualizarVelocidade();
    carregarVozes();

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = carregarVozes;
    }
}