document.addEventListener('DOMContentLoaded', function () {
    const cnpjInput = document.getElementById('cnpjInput');

    // Máscara do CNPJ
    function applyCnpjMask(value) {
        return value
            .replace(/\D/g, '') 
            .replace(/(\d{2})(\d)/, '$1.$2') 
            .replace(/(\d{3})(\d)/, '$1.$2') 
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2'); 
    }

    cnpjInput.addEventListener('input', () => {
        cnpjInput.value = applyCnpjMask(cnpjInput.value);
    });

    document.getElementById('consultarBtn').addEventListener('click', () => {
        const cnpj = cnpjInput.value.replace(/[^\d]+/g, ''); // Remover caracteres não numéricos
        if (cnpj.length !== 14) {
            alert('CNPJ inválido.');
            return;
        }

        fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
            .then(response => response.json())
            .then(data => {
                // Visualizar os dados da empresa
                displayCompanyData(data);
                // Visualizar os dados dos sócios
                displaySociosData(data.socios || []);
                // Mostrar botões de ação
                document.getElementById('actionButtons').classList.remove('hidden');
            })
            .catch(error => console.error('Erro ao consultar CNPJ:', error));
    });

    function displayCompanyData(data) {
        const empresaData = document.getElementById('empresaData');
        empresaData.innerHTML = `
            <h2>Dados da Empresa</h2>
            <div class="form-group">
                <label>Nome:</label>
                <input type="text" id="nome" class="form-control" value="${data.nome || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Razão Social:</label>
                <input type="text" id="razaoSocial" class="form-control" value="${data.razao_social || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Data de Abertura:</label>
                <input type="text" id="dataAbertura" class="form-control" value="${data.data_abertura || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Situação:</label>
                <input type="text" id="situacao" class="form-control" value="${data.situacao || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Atividade Principal:</label>
                <input type="text" id="atividadePrincipal" class="form-control" value="${data.atividade_principal || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Endereço:</label>
                <input type="text" id="endereco" class="form-control" value="${data.logradouro || ''}, ${data.bairro || ''}, ${data.municipio || ''}, ${data.uf || ''}, ${data.cep || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Telefone:</label>
                <input type="text" id="telefone" class="form-control" value="${data.telefone || ''}" readonly>
            </div>
            <div class="form-group">
                <label>E-mail:</label>
                <input type="text" id="email" class="form-control" value="${data.email || ''}" readonly>
            </div>
        `;
        empresaData.classList.remove('hidden');
    }

    function displaySociosData(socios) {
        const sociosData = document.getElementById('sociosData');
        sociosData.innerHTML = '<h2>Dados dos Sócios</h2>';
        if (socios.length === 0) {
            sociosData.innerHTML += '<p>Nenhum sócio encontrado.</p>';
        } else {
            socios.forEach(socio => {
                sociosData.innerHTML += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${socio.nome || 'Nome não disponível'}</h5>
                            <p class="card-text"><strong>CPF:</strong> ${socio.cpf || 'Não disponível'}</p>
                            <p class="card-text"><strong>Qualificação:</strong> ${socio.qualificacao || 'Não disponível'}</p>
                        </div>
                    </div>
                `;
            });
        }
        sociosData.classList.remove('hidden');
    }

    document.getElementById('editBtn').addEventListener('click', () => {
        // Inputs editáveis
        document.querySelectorAll('#empresaData input').forEach(input => input.removeAttribute('readonly'));
        document.getElementById('editBtn').classList.add('d-none');
        document.getElementById('saveBtn').classList.remove('d-none');
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        // Salvar os dados atulalizados
        const updatedData = {
            nome: document.getElementById('nome').value,
            razao_social: document.getElementById('razaoSocial').value,
            data_abertura: document.getElementById('dataAbertura').value,
            situacao: document.getElementById('situacao').value,
            atividade_principal: document.getElementById('atividadePrincipal').value,
            logradouro: document.getElementById('endereco').value.split(',')[0].trim(),
            bairro: document.getElementById('endereco').value.split(',')[1]?.trim() || '',
            municipio: document.getElementById('endereco').value.split(',')[2]?.trim() || '',
            uf: document.getElementById('endereco').value.split(',')[3]?.trim() || '',
            cep: document.getElementById('endereco').value.split(',')[4]?.trim() || '',
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value
        };

        console.log('Dados atualizados:', updatedData);
        alert('Dados salvos!');

        // Voltar para inputs não editaveis
        document.querySelectorAll('#empresaData input').forEach(input => input.setAttribute('readonly', 'true'));
        document.getElementById('editBtn').classList.remove('d-none');
        document.getElementById('saveBtn').classList.add('d-none');
    });
});
