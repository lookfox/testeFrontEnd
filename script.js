document.addEventListener('DOMContentLoaded', function () {
    const cnpjInput = document.getElementById('cnpjInput');

    //\Mmáscara do CNPJ
    function applyCnpjMask(value) {
        return value
            .replace(/\D/g, '') // Remove tudo que não é dígito
            .replace(/(\d{2})(\d)/, '$1.$2') // Coloca o primeiro ponto
            .replace(/(\d{3})(\d)/, '$1.$2') // Coloca o segundo ponto
            .replace(/(\d{3})(\d)/, '$1/$2') // Coloca a barra
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2'); // Coloca o hífen
    }

    // Formatação da data dd/mm/aaaa
    function formatDate(dateString) {
        const dateParts = dateString.split('-');
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    }

    cnpjInput.addEventListener('input', () => {
        cnpjInput.value = applyCnpjMask(cnpjInput.value);
    });

    document.getElementById('consultarBtn').addEventListener('click', () => {
        const cnpj = cnpjInput.value.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos
        if (cnpj.length !== 14) {
            alert('CNPJ inválido.');
            return;
        }

        fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
            .then(response => response.json())
            .then(data => {
                // Mostra os dados da empresa
                displayCompanyData(data);
                // Mostra os dados dos sócios
                displaySociosData(data.qsa || []);
                // Botões de ação
                document.getElementById('actionButtons').classList.remove('hidden');
            })
            .catch(error => console.error('Erro ao consultar CNPJ:', error));
    });

    function displayCompanyData(data) {
        const empresaData = document.getElementById('empresaData');
        empresaData.innerHTML = `
            <h2>Dados da Empresa</h2>
            <div class="form-group">
                <label>Nome Fantasia:</label>
                <input type="text" id="nome" class="form-control" value="${data.nome_fantasia || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Razão Social:</label>
                <input type="text" id="razaoSocial" class="form-control" value="${data.razao_social || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Data de Abertura:</label>
                <input type="text" id="dataAbertura" class="form-control" value="${data.data_inicio_atividade ? formatDate(data.data_inicio_atividade) : ''}" readonly>
            </div>
            <div class="form-group">
                <label>Situação:</label>
                <input type="text" id="situacao" class="form-control" value="${data.descricao_situacao_cadastral || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Atividade Principal:</label>
                <input type="text" id="atividadePrincipal" class="form-control" value="${data.cnae_fiscal_descricao || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Endereço:</label>
                <input type="text" id="endereco" class="form-control" value="${data.descricao_tipo_de_logradouro || ''} ${data.logradouro || ''}, ${data.numero || ''}, ${data.complemento || ''}, ${data.bairro || ''}, ${data.municipio || ''}, ${data.uf || ''}, ${data.cep || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Telefone:</label>
                <input type="text" id="telefone" class="form-control" value="${data.ddd_telefone_1 || ''}" readonly>
            </div>
            <div class="form-group">
                <label>E-mail:</label>
                <input type="text" id="email" class="form-control" value="${data.email || 'Não disponível'}" readonly>
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
                            <h5 class="card-title">${socio.nome_socio || 'Nome não disponível'}</h5>
                            <p class="card-text"><strong>CPF:</strong> ${socio.cnpj_cpf_do_socio || 'Não disponível'}</p>
                            <p class="card-text"><strong>Qualificação:</strong> ${socio.codigo_qualificacao_socio || 'Não disponível'}</p>
                        </div>
                    </div>
                `;
            });
        }
        sociosData.classList.remove('hidden');
    }

    document.getElementById('editBtn').addEventListener('click', () => {
        // Transformar os botões em editaveis e salvar
        document.querySelectorAll('#empresaData input').forEach(input => input.removeAttribute('readonly'));
        document.getElementById('editBtn').classList.add('d-none');
        document.getElementById('saveBtn').classList.remove('d-none');
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        
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

        // Voltar para o modo leitura
        document.querySelectorAll('#empresaData input').forEach(input => input.setAttribute('readonly', 'true'));
        document.getElementById('editBtn').classList.remove('d-none');
        document.getElementById('saveBtn').classList.add('d-none');
    });
});
