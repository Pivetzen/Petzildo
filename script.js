const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQx1ICjDoPinvjFEYikC5TNenofQjLRG29eLxSFMvVkn-hJD7ePC_or8iVCm7ZGcrzsUsSak665NXOW/pub?output=csv';

async function loadPets() {
    const response = await fetch(url);
    const data = await response.text();
    
    // Converte CSV em Array de Objetos
    const rows = data.split('\n').slice(1);
    const container = document.getElementById('pet-container');
    container.innerHTML = ''; // Limpa o loading

    rows.forEach(row => {
        const columns = row.split(',');
        if (columns.length < 5) return; // Pula linhas vazias

        // Mapeamento baseado nas colunas da sua planilha
        const pet = {
            nome: columns[0],
            apelido: columns[1],
            tutor: columns[2],
            idade: columns[3],
            raca: columns[4],
            especie: columns[5],
            caracteristica: columns[6],
            sexo: columns[7],
            foto: columns[8]
        };

        const card = document.createElement('div');
        card.className = 'card';
        
        // Define o ícone do Pin
        const pinIcon = pet.especie.toLowerCase().includes('gato') ? '🐱' : 
                        pet.especie.toLowerCase().includes('cachorro') ? '🐶' : '🐾';

        card.innerHTML = `
            <div class="species-pin">${pinIcon} ${pet.especie}</div>
            <div class="card-img" style="background-image: url('${pet.foto}')"></div>
            <div class="content">
                <div class="name-row">
                    <h3>${pet.nome}</h3>
                    <span class="${pet.sexo.trim() === 'Macho' ? 'gender-m' : 'gender-f'}">
                        ${pet.sexo.trim() === 'Macho' ? '♂' : '♀'}
                    </span>
                </div>
                <p style="margin: -10px 0 10px 0; color: #666;">"${pet.apelido}"</p>
                
                <div class="info-grid">
                    <div><strong>Tutor:</strong> ${pet.tutor}</div>
                    <div><strong>Idade:</strong> ${pet.idade}</div>
                    <div><strong>Raça:</strong> ${pet.raca}</div>
                </div>
                <p class="bio">${pet.caracteristica}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

loadPets();
