// Banco de Dados de Referência de Gemas
const GEMSTONES = [
  { id: "diamante", namePt: "Diamante", mineralGroup: "Elemento Nativo", densityMin: 3.51, densityMax: 3.53, mohsHardness: 10, color: "#E2E8F0" },
  { id: "rubi", namePt: "Rubi", mineralGroup: "Coríndon", densityMin: 3.97, densityMax: 4.05, mohsHardness: 9, color: "#EF4444" },
  { id: "safira", namePt: "Safira", mineralGroup: "Coríndon", densityMin: 3.95, densityMax: 4.03, mohsHardness: 9, color: "#3B82F6" },
  { id: "esmeralda", namePt: "Esmeralda", mineralGroup: "Berilo", densityMin: 2.67, densityMax: 2.78, mohsHardness: 7.5, color: "#10B981" },
  { id: "ametista", namePt: "Ametista", mineralGroup: "Quartzo", densityMin: 2.63, densityMax: 2.65, mohsHardness: 7, color: "#8B5CF6" }
];

// Estado Global do App
let activeTab = 'laboratorio';
let acervo = JSON.parse(localStorage.getItem('gemscan_acervo')) || [];
let photoPreview = null;
let calculatedDensity = null;
let mathMatches = [];

// Função Principal de Renderização da Interface
function render() {
  const app = document.getElementById('app');
  
  let content = '';

  // HEADER FIXO
  let header = `
    <header class="p-4 border-b border-amber-500/10 flex items-center justify-between bg-[#13161c]">
      <h1 class="text-xl font-bold tracking-wider text-amber-400 font-serif">GEMSCAN</h1>
      <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">SISTEMA PWA</span>
    </header>
  `;

  // TELA 1: LABORATÓRIO
  if (activeTab === 'laboratorio') {
    content = `
      <div class="space-y-5 fade-in-up p-4 max-w-md mx-auto">
        <!-- Inputs de Mídia separados para garantir funcionamento no Android -->
        <div class="p-4 rounded-xl border border-amber-500/10 bg-[#13161c]">
          <h2 class="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 font-sans">1. Análise Visual</h2>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="document.getElementById('cameraInput').click()" class="flex items-center justify-center gap-2 bg-amber-500 text-black font-semibold p-3 rounded-lg text-xs active:scale-95 transition-transform">
              <i data-lucide="camera" class="w-4 h-4"></i> Câmera Traseira
            </button>
            <button onclick="document.getElementById('fileInput').click()" class="flex items-center justify-center gap-2 bg-slate-800 text-amber-400 border border-amber-500/20 font-semibold p-3 rounded-lg text-xs active:scale-95 transition-transform">
              <i data-lucide="image" class="w-4 h-4"></i> Galeria
            </button>
          </div>
          
          <input id="fileInput" type="file" accept="image/*" class="hidden" onchange="handlePhoto(event)">
          <input id="cameraInput" type="file" accept="image/*" capture="environment" class="hidden" onchange="handlePhoto(event)">

          ${photoPreview ? `
            <div class="mt-3">
              <img src="${photoPreview}" class="w-full h-40 object-cover rounded-lg border border-amber-500/30 gem-glow" />
            </div>
          ` : ''}
        </div>

        <!-- Teste Físico de Arquimedes -->
        <div class="p-4 rounded-xl border border-amber-500/10 bg-[#13161c]">
          <h2 class="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">2. Teste de Arquimedes (Física)</h2>
          <div class="space-y-3">
            <div>
              <label class="text-[11px] text-slate-400 block mb-1">Peso Seco / No Ar (g)</label>
              <input type="number" id="dryWeight" class="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-500" placeholder="0.00">
            </div>
            <div>
              <label class="text-[11px] text-slate-400 block mb-1">Peso Submerso na Água (g)</label>
              <input type="number" id="submergedWeight" class="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-500" placeholder="0.00">
            </div>
            <button onclick="calcularDensidade()" class="w-full py-2.5 bg-amber-500 text-black font-bold rounded-lg text-xs shadow-lg shadow-amber-500/5">
              Calcular Densidade Hidrostática
            </button>
          </div>

          ${calculatedDensity !== null ? `
            <div class="mt-4 p-3 bg-slate-900 rounded-lg border border-emerald-500/20">
              <p class="text-[10px] text-slate-400 uppercase">Resultado do Cálculo:</p>
              <p class="text-2xl font-bold text-emerald-400">${calculatedDensity.toFixed(3)} g/cm³</p>
              
              <div class="mt-3 space-y-2">
                <p class="text-[10px] font-semibold text-amber-400 uppercase">Gemas Compatíveis (Janela de Tolerância):</p>
                ${mathMatches.length === 0 ? `
                  <p class="text-xs text-slate-400">Nenhuma gema correspondente encontrada no intervalo.</p>
                ` : mathMatches.map(gem => `
                  <div class="flex items-center justify-between p-2 bg-slate-800 rounded border border-slate-700">
                    <div>
                      <p class="text-xs font-bold text-white">${gem.namePt}</p>
                      <p class="text-[10px] text-slate-400">${gem.mineralGroup} • Dureza: ${gem.mohsHardness}</p>
                    </div>
                    <button onclick="salvarNoAcervo('${gem.namePt}', '${gem.mineralGroup}')" class="text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded font-medium">
                      + Acervo
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // TELA 2: MEU ACERVO
  if (activeTab === 'acervo') {
    content = `
      <div class="space-y-4 fade-in-up p-4 max-w-md mx-auto">
        <h2 class="text-base font-serif text-amber-400 mb-2">Seu Acervo Guardado</h2>
        ${acervo.length === 0 ? `
          <p class="text-xs text-slate-400 text-center py-8">Seu acervo local está vazio. Salve resultados na aba Laboratório.</p>
        ` : acervo.map(item => `
          <div class="p-3 rounded-lg border border-slate-800 bg-[#13161c] flex gap-3 items-center">
            ${item.photo ? `<img src="${item.photo}" class="w-12 h-12 object-cover rounded border border-slate-700" />` : `<div class="w-12 h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center"><i data-lucide="gem" class="w-5 h-5 text-amber-500"></i></div>`}
            <div class="flex-1">
              <h3 class="font-bold text-xs text-white">${item.name}</h3>
              <p class="text-[10px] text-slate-400">${item.group}</p>
              <p class="text-[10px] text-emerald-400 font-mono">${item.density} g/cm³ • ${item.date}</p>
            </div>
            <button onclick="deletarDoAcervo(${item.id})" class="text-rose-400 p-2 hover:bg-rose-500/10 rounded">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // TELA 3: MANUAL DE REFERÊNCIA
  if (activeTab === 'manual') {
    content = `
      <div class="space-y-3 fade-in-up p-4 max-w-md mx-auto">
        <h2 class="text-base font-serif text-amber-400 mb-2">Manual Técnico de Referência</h2>
        ${GEMSTONES.map(gem => `
          <div class="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <div>
              <h3 class="font-bold text-xs" style="color: ${gem.color}">${gem.namePt}</h3>
              <p class="text-[10px] text-slate-400">Grupo: ${gem.mineralGroup}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-mono text-amber-500">Densidade: ${gem.densityMin} - ${gem.densityMax}</p>
              <p class="text-[10px] text-slate-500">Dureza Mohs: ${gem.mohsHardness}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // NAVEGAÇÃO INFERIOR FIXA
  let nav = `
    <nav class="fixed bottom-0 left-0 right-0 h-16 bg-[#13161c] border-t border-slate-800 flex justify-around items-center z-50 max-w-md mx-auto">
      <button onclick="switchTab('laboratorio')" class="flex flex-col items-center gap-0.5 text-[10px] ${activeTab === 'laboratorio' ? 'text-amber-400' : 'text-slate-400'}">
        <i data-lucide="flask-conical" class="w-5 h-5"></i>
        <span>Laboratório</span>
      </button>
      <button onclick="switchTab('acervo')" class="flex flex-col items-center gap-0.5 text-[10px] ${activeTab === 'acervo' ? 'text-amber-400' : 'text-slate-400'}">
        <i data-lucide="book-open" class="w-5 h-5"></i>
        <span>Meu Acervo</span>
      </button>
      <button onclick="switchTab('manual')" class="flex flex-col items-center gap-0.5 text-[10px] ${activeTab === 'manual' ? 'text-amber-400' : 'text-slate-400'}">
        <i data-lucide="book-marked" class="w-5 h-5"></i>
        <span>Manual</span>
      </button>
    </nav>
  `;

  app.innerHTML = header + content + nav;
  lucide.createIcons(); // Inicializa os ícones do Lucide
}

// Funções de Controle de Estado e Eventos
window.switchTab = function(tab) {
  activeTab = tab;
  render();
};

window.handlePhoto = function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      photoPreview = reader.result;
      render();
    };
    reader.readAsDataURL(file);
  }
};

window.calcularDensidade = function() {
  const dry = parseFloat(document.getElementById('dryWeight').value);
  const sub = parseFloat(document.getElementById('submergedWeight').value);

  if (!dry || !sub || dry <= sub) {
    alert("Dados inválidos. O peso seco deve ser obrigatoriamente maior que o peso submerso.");
    return;
  }

  calculatedDensity = dry / (dry - sub);
  
  // Filtro inteligente com tolerância física de 0.05
  const tolerance = 0.05;
  mathMatches = GEMSTONES.filter(gem => 
    gem.densityMin <= (calculatedDensity + tolerance) && gem.densityMax >= (calculatedDensity - tolerance)
  );

  render();
};

window.salvarNoAcervo = function(name, group) {
  const item = {
    id: Date.now(),
    name: name,
    group: group,
    density: calculatedDensity.toFixed(3),
    photo: photoPreview,
    date: new Date().toLocaleDateString('pt-BR')
  };
  acervo.push(item);
  localStorage.setItem('gemscan_acervo', JSON.stringify(acervo));
  alert(`${name} adicionado ao seu acervo!`);
  render();
};

window.deletarDoAcervo = function(id) {
  acervo = acervo.filter(item => item.id !== id);
  localStorage.setItem('gemscan_acervo', JSON.stringify(acervo));
  render();
};

// Inicialização Inicial na Tela
render();