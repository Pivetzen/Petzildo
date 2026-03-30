const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQx1ICjDoPinvjFEYikC5TNenofQjLRG29eLxSFMvVkn-hJD7ePC_or8iVCm7ZGcrzsUsSak665NXOW/pub?output=csv';

async function loadSinglePet() {
    const response = await fetch(sheetUrl);
    const data = await response.text();
    const rows = data.split('\n').slice(1).filter(r => r.trim() !== "");
    
    // Pega o ID da URL (?id=0, ?id=1, etc). Se não tiver, começa no 0.
    const urlParams = new URLSearchParams(window.location.search);
    let petId = parseInt(urlParams.get('id')) || 0;

    // Se o ID for maior que a lista, volta pro primeiro
    if (petId >= rows.length) petId = 0;

    const columns = rows[petId].split(',');
    
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

    const display = document.getElementById('pet-display');
    
    // Lógica do Ícone do Pin
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
                <p><strong>Tutor:</strong> ${pet.tutor}</p>
                <p><strong>Idade:</strong> ${pet.idade}</p>
                <p><strong>Raça:</strong> ${pet.raca}</p>
                <p><em>${pet.caracteristica}</em></p>
            </div>
        </div>
    `;

    // Guarda o próximo ID globalmente para a função nextPet
    window.nextPetId = petId + 1;
}

function nextPet() {
    // Recarrega a página com o novo ID na URL, forçando novas impressões de anúncios
    window.location.href = `index.html?id=${window.nextPetId}`;
}

function shareWhatsApp() {
    // Pega o nome do pet que está sendo exibido no momento
    const petNome = document.querySelector('.name-row h2').innerText;
    // Pega a URL atual do navegador (que já tem o ?id=X)
    const urlAtual = window.location.href;
    
    // Mensagem personalizada para o convite
    const mensagem = encodeURIComponent(`Olha que fofura o ${petNome} no meu Pet Trunfo! 😍 Veja a cartinha completa aqui: ${urlAtual}`);
    
    // Abre o link do WhatsApp
    window.open(`https://api.whatsapp.com/send?text=${mensagem}`, '_blank');
}
loadSinglePet();
