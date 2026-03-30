const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQx1ICjDoPinvjFEYikC5TNenofQjLRG29eLxSFMvVkn-hJD7ePC_or8iVCm7ZGcrzsUsSak665NXOW/pub?output=csv';

async function loadSinglePet() {
    try {
        const response = await fetch(sheetUrl);
        const data = await response.text();
        const rows = data.split(/\r?\n/).filter(r => r.trim() !== "");
        const header = rows.shift(); // Remove cabeçalho
        
        const totalPets = rows.length;
        const urlParams = new URLSearchParams(window.location.search);
        let petId = parseInt(urlParams.get('id')) || 0;

        if (petId >= totalPets) petId = 0;

        const columns = rows[petId].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        // Formatação da Idade
        let idadeTexto = columns[3]?.replace(/"/g, '').trim();
        if (idadeTexto === "0" || idadeTexto.toLowerCase() === "0 anos") {
            idadeTexto = "👶 Filhote";
        } else if (!idadeTexto.toLowerCase().includes("ano")) {
            idadeTexto += " anos";
        }

        const pet = {
            nome: columns[0]?.replace(/"/g, ''),
            apelido: columns[1]?.replace(/"/g, ''),
            idade: idadeTexto,
            especie: columns[5]?.replace(/"/g, ''),
            sexo: columns[7]?.replace(/"/g, ''),
            foto: columns[8]?.replace(/"/g, ''),
            caracteristica: columns[6]?.replace(/"/g, '')
        };

        // Atualiza as Meta Tags para o WhatsApp
        document.title = `Pet Trunfo: ${pet.nome}`;
        document.getElementById('og-title').content = `Conheça o ${pet.nome}!`;
        document.getElementById('og-image').content = pet.foto;

        // Renderiza o Card (Mantendo sua estrutura anterior)
        const display = document.getElementById('pet-display');
        const icon = pet.especie.toLowerCase().includes('gato') ? '🐱' : '🐶';
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
                    <p><strong>"${pet.apelido}"</strong></p>
                    <hr>
                    <p><strong>Idade:</strong> ${pet.idade}</p>
                    <p class="bio"><em>${pet.caracteristica}</em></p>
                </div>
            </div>
        `;

        // Gera o Passador (1) (2) (3)...
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

    } catch (e) { console.error(e); }
}

function nextPet() {
    window.location.href = `?id=${window.nextPetId}`;
}

function randomPet() {
    const randomId = Math.floor(Math.random() * window.totalCount);
    window.location.href = `?id=${randomId}`;
}

function shareWhatsApp() {
    const petNome = document.querySelector('.name-row h2').innerText;
    const urlAtual = window.location.href;
    const mensagem = encodeURIComponent(`Olha que fofura o ${petNome}! 😍 Veja a cartinha: ${urlAtual}`);
    window.open(`https://api.whatsapp.com/send?text=${mensagem}`, '_blank');
}

loadSinglePet();
