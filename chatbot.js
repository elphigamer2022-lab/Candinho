document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos do DOM do chatbot
    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChatbotBtn = document.getElementById('close-chatbot-btn');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatbotBody = document.getElementById('chatbot-body');

    // Cria o elemento do indicador de digitação (os três pontos animados)
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.classList.add('bot-message');
    typingIndicator.innerHTML = `<span></span><span></span><span></span>`;

    let currentState = 'greeting'; // Estado inicial do fluxo de conversa
    const userData = {}; // Objeto para armazenar os dados do usuário (nome, telefone, etc.)

    // Função para obter os horários disponíveis com base no dia da semana
    function getAvailableTimes(day) {
        const dayLower = day.toLowerCase();
        // Neste exemplo, a sexta-feira não tem horários disponíveis. Você pode alterar essa lógica.
        if (dayLower.includes('sexta')) {
            return [];
        } else {
            // Horários disponíveis. Você pode adicionar ou remover horários aqui.
            return ['14:00', '15:00', '16:00', '17:00', '18:00'];
        }
    }

    // Função para obter a localização GPS
    function getGpsLocation() {
        // Coordenadas GPS da empresa. Você precisa alterar essas coordenadas para as suas.
        const latitude = '-26.804932'; // Altere a latitude
        const longitude = '-50.999661'; // Altere a longitude
        const name = 'Assistência 24 h'; // Altere o nome da sua localização
        // Retorna o link formatado para o Google Maps
        return `http://maps.google.com/?q=${latitude},${longitude}&destination=${name}`;
    }

    // Objeto que define o fluxo de conversa do chatbot (dialog flow)
    const dialogFlow = {
        'greeting': {
            // Mensagem inicial do bot. Você pode editar o texto
            message: 'Olá! Sou o assistente de agendamentos da Candinho-Estética-Automotiva.',
            // Opções de botões que o bot oferece ao usuário
            options: ['Agendar Horário'],
            // Função para transição de estado. Decide qual o próximo passo com base na resposta do usuário
            transition: (input) => {
                const lowerInput = input.toLowerCase();
                if (lowerInput.includes('agendar')) {
                    return 'startSchedule';
                }
                return 'fallback'; // Retorna para o estado de fallback se não entender a entrada
            }
        },
        'startSchedule': {
            // Mensagem para pedir os dados do usuário. Você pode editar o texto
            message: 'Para agendar, por favor, me informe seu nome e telefone para contato.',
            transition: (input) => {
                const parts = input.split(/[\s,]+/);
                if (parts.length >= 2) {
                    userData.name = parts[0];
                    userData.phone = parts.slice(1).join('');
                    return 'askDay';
                }
                return 'fallback';
            }
        },
        'askDay': {
            // Mensagem para pedir o dia
            message: 'Perfeito, agora me diga para qual dia da semana você gostaria de agendar?',
            // Opções de dias da semana
            options: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
            transition: (input) => {
                const lowerInput = input.toLowerCase();
                const validDays = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
                if (validDays.includes(lowerInput)) {
                    userData.day = lowerInput;
                    return 'askTime';
                }
                return 'fallback';
            }
        },
        'askTime': {
            // Função para obter a mensagem, que pode mudar dependendo dos horários disponíveis
            getMessage: () => {
                const availableTimes = getAvailableTimes(userData.day);
                if (availableTimes.length > 0) {
                    return `Ótimo! Para ${userData.day}, temos os seguintes horários disponíveis. Qual você prefere?`;
                } else {
                    return `Desculpe, não há horários disponíveis para ${userData.day}. Por favor, tente outro dia.`;
                }
            },
            // Função para gerar as opções de horários dinamicamente
            options: () => {
                const availableTimes = getAvailableTimes(userData.day);
                return availableTimes.length > 0 ? availableTimes : ['Tentar outro dia'];
            },
            transition: (input) => {
                const availableTimes = getAvailableTimes(userData.day);
                const lowerInput = input.toLowerCase();
                if (availableTimes.includes(lowerInput)) {
                    userData.time = lowerInput;
                    return 'askPaymentMethod';
                }
                if (lowerInput === 'tentar outro dia') {
                    return 'askDay';
                }
                return 'fallback';
            }
        },
        'askPaymentMethod': {
            // Mensagem para perguntar a forma de pagamento
            message: 'Para finalizar, qual será a forma de pagamento, Pix ou Dinheiro?',
            // Opções de pagamento
            options: ['Pix', 'Dinheiro'],
            transition: (input) => {
                const lowerInput = input.toLowerCase();
                if (lowerInput.includes('pix')) {
                    userData.payment = 'Pix';
                    return 'finalMessagePix';
                }
                if (lowerInput.includes('dinheiro')) {
                    userData.payment = 'Dinheiro';
                    return 'finalMessageCash';
                }
                return 'fallback';
            }
        },
        'finalMessagePix': {
            // Mensagem final para agendamentos com Pix
            getMessage: () => `Obrigado, ${userData.name}! Estamos te esperando no dia ${userData.day} às ${userData.time}. A forma de pagamento será Pix.\n\nVocê será redirecionado para o WhatsApp para confirmar o pagamento e a localização.`,
            final: true // Marca este estado como final para que o bot recomece o fluxo
        },
        'finalMessageCash': {
            // Mensagem final para agendamentos com dinheiro
            getMessage: () => `Obrigado, ${userData.name}! Estamos te esperando no dia ${userData.day} às ${userData.time}. O pagamento será em dinheiro no local.`,
            final: true // Marca este estado como final
        },
        'fallback': {
            // Mensagem de fallback (quando o bot não entende a resposta do usuário)
            message: 'Desculpe, não entendi. Por favor, use as opções ou tente novamente.',
            transition: () => currentState // Volta para o estado atual
        }
    };
    
    // Função para gerar a mensagem formatada para o WhatsApp
    function generateWhatsappMessage(data) {
        const pixKey = 'sua_chave_pix_aqui'; // Altere esta chave PIX para a sua
        let message = `Olá! Tenho um novo agendamento:\n\n`;
        message += `Nome: ${data.name}\n`;
        message += `Telefone: ${data.phone}\n`;
        message += `Dia: ${data.day}\n`;
        message += `Horário: ${data.time}\n`;
        message += `Forma de Pagamento: ${data.payment}\n\n`;
        // Se a forma de pagamento for Pix, adiciona a chave na mensagem
        if (data.payment === 'Pix') {
            message += `Chave Pix para pagamento: ${pixKey}\n\n`;
            message += `Por favor, envie o comprovante de pagamento para agilizar o atendimento. Obrigado!`;
        }
        return encodeURIComponent(message);
    }
    
    // Função para redirecionar para o WhatsApp
    function sendDataToWhatsapp(data) {
        const ownerPhoneNumber = '5599999999999'; // Mude este número para o seu telefone de contato
        const message = generateWhatsappMessage(data);
        const whatsappUrl = `https://wa.me/${ownerPhoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    }

    // Função para adicionar uma mensagem à interface do chat
    function addMessageToChat(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${type}-message`);
        messageDiv.textContent = message;
        chatbotBody.appendChild(messageDiv);
        chatbotBody.scrollTop = chatbotBody.scrollHeight; // Rola a tela para a mensagem mais recente
    }

    // Função para adicionar a resposta do bot com opções de botão
    function addBotResponseWithFlow(message, options) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        messageDiv.textContent = message;
        chatbotBody.appendChild(messageDiv);

        if (options && options.length > 0) {
            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('message-options');
            options.forEach(optionText => {
                const optionButton = document.createElement('button');
                optionButton.classList.add('option-button');
                optionButton.textContent = optionText;
                // Adiciona um evento de clique para cada botão de opção
                optionButton.addEventListener('click', () => {
                    handleUserOption(optionText);
                });
                optionsDiv.appendChild(optionButton);
            });
            chatbotBody.appendChild(optionsDiv);
        }
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
    }
    
    // Função para adicionar o botão de localização GPS
    function addGpsButton() {
        const gpsLink = getGpsLocation();
        const buttonDiv = document.createElement('div');
        buttonDiv.classList.add('message-options');
        
        const linkButton = document.createElement('a');
        linkButton.classList.add('option-button');
        linkButton.textContent = 'Ver Localização no GPS';
        linkButton.href = gpsLink;
        linkButton.target = '_blank';

        buttonDiv.appendChild(linkButton);
        chatbotBody.appendChild(buttonDiv);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
    }
    
    // Função para exibir o indicador de digitação
    function showTypingIndicator() {
        chatbotBody.appendChild(typingIndicator);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
        typingIndicator.style.display = 'flex';
    }

    // Função para ocultar o indicador de digitação
    function hideTypingIndicator() {
        if (chatbotBody.contains(typingIndicator)) {
            chatbotBody.removeChild(typingIndicator);
        }
        typingIndicator.style.display = 'none';
    }

    // Função principal para lidar com a resposta do bot
    function handleBotResponse(input) {
        let response = dialogFlow[currentState];
        
        if (response.transition) {
            const nextState = response.transition(input);
            if (nextState) {
                currentState = nextState;
                response = dialogFlow[currentState];
            } else {
                response = dialogFlow['fallback'];
            }
        }
        
        const messageText = typeof response.getMessage === 'function' ? response.getMessage() : response.message;
        const messageOptions = typeof response.options === 'function' ? response.options() : response.options;

        addBotResponseWithFlow(messageText, messageOptions);

        if (currentState === 'finalMessagePix') {
            sendDataToWhatsapp(userData); // Redireciona para o WhatsApp se o pagamento for Pix
        }
        
        if (response.final) {
            addGpsButton(); // Adiciona o botão de GPS no final do fluxo
            setTimeout(() => {
                currentState = 'greeting'; // Reinicia o fluxo para a saudação inicial
                addBotResponseWithFlow(dialogFlow.greeting.message, dialogFlow.greeting.options);
            }, 5000); // Pausa de 5 segundos antes de reiniciar o chat
        }
    }
    
    // Função para lidar com o clique do usuário nas opções (botões)
    function handleUserOption(optionText) {
        addMessageToChat(optionText, 'user');
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            handleBotResponse(optionText);
        }, 800);
    }

    // Função para lidar com a entrada de texto do usuário
    function handleUserInput() {
        const userMessage = userInput.value;
        if (userMessage.trim() === '') return; // Não faz nada se a mensagem estiver vazia

        addMessageToChat(userMessage, 'user');
        userInput.value = ''; // Limpa o campo de entrada
        showTypingIndicator();

        setTimeout(() => {
            hideTypingIndicator();
            handleBotResponse(userMessage);
        }, 800);
    }

    // Evento de clique para abrir/fechar o chatbot
    chatbotToggleBtn.addEventListener('click', () => {
        chatbotContainer.classList.toggle('hidden');
        if (!chatbotContainer.classList.contains('hidden')) {
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                addBotResponseWithFlow(dialogFlow.greeting.message, dialogFlow.greeting.options);
            }, 800);
            userInput.focus();
        }
    });

    // Evento de clique para fechar o chatbot
    closeChatbotBtn.addEventListener('click', () => {
        chatbotContainer.classList.add('hidden');
    });

    // Evento de clique para o botão de envio
    sendBtn.addEventListener('click', handleUserInput);
    // Evento de tecla para o campo de entrada (permite enviar com a tecla Enter)
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleUserInput();
        }
    });
});
