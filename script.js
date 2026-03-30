const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQx1ICjDoPinvjFEYikC5TNenofQjLRG29eLxSFMvVkn-hJD7ePC_or8iVCm7ZGcrzsUsSak665NXOW/pub?output=csv';

async function loadSinglePet() {
    try {
        const response = await fetch(sheetUrl);
        const data = await response.text();
        const rows = data.split(/\r?\n/).filter(r => r.trim() !== "");
        const header = rows.shift(); 
        
async function loadSinglePet() {
    try {
        const response = await fetch(sheetUrl);
        const data = await response.text();
        let rows = data.split(/\r?\n/).filter(r => r.trim() !== "");
        const header = rows.shift(); 
        
        // --- NOVA LÓGICA DE FILTRO ---
        const onlyAdoption = document.getElementById('filter-adoption').checked;
        
        if (onlyAdoption) {
            // Filtra as linhas onde a Coluna K (índice 10) é "Sim"
            rows = rows.filter(row => {
                const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                return cols[10] && cols[10].replace(/"/g, '').trim().toLowerCase() === 'sim';
            });
        }
        // -----------------------------

        const totalPets = rows.length;
        if (totalPets === 0) {
            document.getElementById('pet-display').innerHTML = "Nenhum pet para adoção no momento. 🐾";
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        let petId = parseInt(urlParams.get('id')) || 0;
        if (petId >= totalPets) petId = 0;

        // O restante do código de mapeamento (Nome, Apelido, Foto, etc.) permanece igual
        const columns = rows[petId].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
        
        /* MAPEAMENTO:
           A(0): Nome | B(1): Apelido | C(2): Tutor | D(3): Idade
           E(4): Data Nasc | F(5): Raça | G(6): Espécie | H(7): Característica
           I(8): Sexo | J(9): Foto | K(10): Adoção
        */

        let idadeBruta = columns[3];
        let idadeTexto = (idadeBruta === "0" || idadeBruta === "" || idadeBruta.toLowerCase().includes("filhote")) 
                         ? "👶 Filhote" 
                         : (idadeBruta.toLowerCase().includes("ano") ? idadeBruta : idadeBruta + " anos");

        const pet = {
            nome: columns[0],
            apelido: columns[1],
            tutor: columns[2],
            idade: idadeTexto,
            raca: columns[5], 
            especie: columns[6],
            caracteristica: columns[7],
            sexo: columns[8],
            foto: columns[9],
            adote: columns[10]
        };

        const isMacho = pet.sexo.toLowerCase().startsWith('macho');
        const paraAdocao = pet.adote && pet.adote.toLowerCase() === 'sim';

        document.title = `Petzildo: ${pet.nome}`;
        document.getElementById('og-title').content = `Conheça o ${pet.nome} no Petzildo! 🐾`;
        document.getElementById('og-image').content = pet.foto;

        const display = document.getElementById('pet-display');
        const icon = pet.especie.toLowerCase().includes('gato') ? '🐱' : 
                     pet.especie.toLowerCase().includes('cachorro') ? '🐶' : '🐾';

        display.innerHTML = `
            <div class="card">
                <div class="tags-container">
                    <div class="species-pin">${icon} ${pet.especie.toUpperCase()}</div>
                    ${paraAdocao ? '<div class="adoption-tag">🏠 PARA ADOÇÃO!</div>' : ''}
                </div>
                <div class="card-img" 
                     style="background-image: url('${pet.foto}')" 
                     onclick="openLightbox('${pet.foto}')"
                     title="Clique para ver a foto completa">
                </div>
                <div class="content">
                    <div class="name-row">
                        <h2>${pet.nome}</h2>
                        <span class="gender" style="color: ${isMacho ? '#4a90e2' : '#e94e77'}">
                            ${isMacho ? '♂' : '♀'}
                        </span>
                    </div>
                    <p style="margin-top:0"><strong>"${pet.apelido}"</strong></p>
                    <div style="font-size: 0.9rem; line-height: 1.6;">
                        <div><strong>Tutor:</strong> ${pet.tutor}</div>
                        <div><strong>Idade:</strong> ${pet.idade}</div>
                        <div><strong>Raça:</strong> ${pet.raca}</div>
                    </div>
                    <p class="bio">${pet.caracteristica}</p>
                </div>
            </div>
        `;

        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        for (let i = 0; i < totalPets; i++) {
            const link = document.createElement('a');
            link.href = `?id=${i}`;
            link.innerText = `(${i + 1})`;
            link.className = `page-link ${i === petId ? 'active' : ''}`;
            pagination.appendChild(link);
        }

        window.nextPetId = (petId + 1) >= totalPets ? 0 : petId + 1;
        window.totalCount = totalPets;

    } catch (e) {
        console.error("Erro Petzildo:", e);
        document.getElementById('pet-display').innerHTML = "Erro ao carregar dados do Petzildo.";
    }
}

// FUNÇÕES DA LIGHTBOX
function openLightbox(url) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    lbImg.src = url;
    lb.style.display = 'flex';
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

function nextPet() { window.location.href = `?id=${window.nextPetId}`; }
function randomPet() { window.location.href = `?id=${Math.floor(Math.random() * window.totalCount)}`; }
function shareWhatsApp() {
    const petNome = document.querySelector('.name-row h2').innerText;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Olha só! ' + petNome + ' está no Petzildo! 😍 ' + window.location.href)}`, '_blank');
}

loadSinglePet();

async function downloadCard() {
    const card = document.querySelector('.card');
    const petNome = document.querySelector('.name-row h2').innerText;

    // Criar um container temporário para a marca d'água
    const watermark = document.createElement('div');
    watermark.innerText = "www.petzildo.com.br"; // Altere para seu link real
    watermark.style.cssText = "position:absolute; bottom:5px; right:10px; font-size:10px; color:rgba(0,0,0,0.3); font-weight:bold; z-index:10;";
    
    card.appendChild(watermark);

    // Gerar a imagem
    html2canvas(card, {
        useCORS: true, // Importante para carregar fotos de links externos (Drive/Imgur)
        scale: 2,      // Melhora a qualidade da imagem
        backgroundColor: "#ffffff"
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Cartinha-${petNome}-Petzildo.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        // Remove a marca d'água do site após o download para não ficar feio na tela
        card.removeChild(watermark);
    });
}
