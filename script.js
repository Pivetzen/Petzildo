const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQx1ICjDoPinvjFEYikC5TNenofQjLRG29eLxSFMvVkn-hJD7ePC_or8iVCm7ZGcrzsUsSak665NXOW/pub?output=csv';

async function loadSinglePet() {
    try {
        const response = await fetch(sheetUrl);
        const data = await response.text();
        const rows = data.split(/\r?\n/).filter(r => r.trim() !== "");
        const header = rows.shift(); // Tira o cabeçalho
        
        const totalPets = rows.length;
        const urlParams = new URLSearchParams(window.location.search);
        let petId = parseInt(urlParams.get('id')) || 0;

        if (petId >= totalPets || petId < 0) petId = 0;

        // Regex para separar CSV tratando aspas
        const columns = rows[petId].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        // Ajuste de Idade (0 = Filhote)
        let idadeBruta = columns[3]?.replace(/"/g, '').trim();
        let idadeTexto = (idadeBruta === "0" || idadeBruta === "" || idadeBruta.toLowerCase() === "0 anos") 
                         ? "👶 Filhote" 
                         : (idadeBruta.toLowerCase().includes("ano") ? idadeBruta : idadeBruta + " anos");

        const pet = {
            nome: columns[0]?.replace(/"/g, ''),
            apelido: columns[1]?.replace(/"/g, ''),
            tutor: columns[2]?.replace(/"/g, ''),
            idade: idadeTexto,
            raca: columns[4]?.replace(/"/g, ''),
            especie: columns[5]?.replace(/"/g, ''),
            caracteristica: columns[6]?.replace(/"/g, ''),
            sexo: columns[7]?.replace(/"/g, ''),
            foto: columns[8]?.replace(/"/g, '')
        };

        // Atualiza as Meta Tags dinamicamente para o Petzildo
        document.title = `Petzildo: ${pet.nome}`;
        document.getElementById('og-title').content = `Conheça o ${pet.nome} no Petzildo! 🐾`;
        document.getElementById('og-image').content = pet.foto;

        const display = document.getElementById('pet-display');
        const icon = pet.especie.toLowerCase().includes('gato') ? '🐱' : 
                     pet.especie.toLowerCase().includes('cachorro') ? '🐶' : '🐾';

        display.innerHTML = `
            <div class="card">
                <div class="species-pin">${icon} ${pet.especie.toUpperCase()}</div>
                <div class="card-img" style="background-image: url('${pet.foto}')"></div>
                <div class="content">
                    <div class="name-row">
                        <h2>${pet.nome}</h2>
                        <span class="gender" style="color: ${pet.sexo.trim() === 'Macho' ? '#4a90e2' : '#e94e77'}">
                            ${pet.sexo.trim() === 'Macho' ? '♂' : '♀'}
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

        // Gerar Passador Numérico do Petzildo
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

function nextPet() {
    window.location.href = `?id=${window.nextPetId}`;
}

function randomPet() {
    const rand = Math.floor(Math.random() * window.totalCount);
    window.location.href = `?id=${rand}`;
}

function shareWhatsApp() {
    const petNome = document.querySelector('.name-row h2').innerText;
    const urlAtual = window.location.href;
    const msg = encodeURIComponent(`Olha que fofura o ${petNome}! 😍 Veja a cartinha completa no Petzildo: ${urlAtual}`);
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
}

loadSinglePet();
