// Acessa o carrinho no localStorage no momento da carga do script
// Tenta buscar o carrinho salvo no navegador. Se não existir, cria um array vazio.
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Salva o carrinho no localStorage e atualiza a interface
function saveCart() {
    // Converte o array 'cart' para uma string JSON e salva no localStorage do navegador
    localStorage.setItem('cart', JSON.stringify(cart));
    // Chama a função para atualizar o contador e o total na interface do usuário
    updateCart();
}

// Adiciona um item ao carrinho
function addItemToCart(item) {
    // Adiciona o novo item (objeto) ao final do array 'cart'
    cart.push(item);
    // Salva o carrinho atualizado no localStorage
    saveCart();
    
    // Animação do botão do carrinho
    const cartBtn = document.getElementById('cart-toggle-btn');
    // Adiciona uma classe CSS para iniciar a animação
    cartBtn.classList.add('animate-cart');
    // Remove a classe após 800 milissegundos para permitir que a animação seja executada novamente
    setTimeout(() => {
        cartBtn.classList.remove('animate-cart');
    }, 800);
}

// Remove um item do carrinho
function removeItemFromCart(index) {
    // Usa o método 'splice' para remover 1 item do array 'cart' na posição 'index'
    cart.splice(index, 1);
    // Salva o carrinho atualizado no localStorage
    saveCart();
}

// Finaliza o pedido e envia via WhatsApp
function checkout() {
    // Verifica se o carrinho está vazio
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    // Altere este número para o número de telefone do proprietário da estética
    const ownerPhoneNumber = '5599999999999'; // Mude este número para o seu telefone de contato do WhatsApp
    // Cria a mensagem inicial do WhatsApp
    let message = "Olá! Gostaria de fazer um pedido na Candinho-estética.\n\nServiços selecionados:\n\n";
    let total = 0;

    // Itera sobre cada item do carrinho para construir a mensagem
    cart.forEach((item, index) => {
        // Adiciona o nome e o preço de cada item à mensagem
        message += `${index + 1}. ${item.name} - R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}\n`;
        // Soma o preço do item ao total
        total += parseFloat(item.price);
    });

    // Adiciona o total e uma mensagem final à mensagem do WhatsApp
    message += `\nTotal: R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
    message += "Aguardando confirmação do agendamento.";

    // Cria a URL do WhatsApp com a mensagem codificada
    const whatsappUrl = `https://wa.me/${ownerPhoneNumber}?text=${encodeURIComponent(message)}`;
    // Abre uma nova janela/aba com a conversa do WhatsApp
    window.open(whatsappUrl, '_blank');

    // Limpa o carrinho após a finalização do pedido
    cart = [];
    // Salva o carrinho vazio no localStorage
    saveCart();
}

// Atualiza a exibição do carrinho
function updateCart() {
    // Seleciona os elementos HTML do carrinho
    const cartItemsList = document.getElementById('cart-items-list');
    const cartCount = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');

    // Verifica se os elementos existem antes de tentar manipulá-los
    if (cartItemsList && cartCount && cartTotalPrice) {
        // Limpa o conteúdo atual da lista de itens
        cartItemsList.innerHTML = '';
        let total = 0;

        // Se o carrinho estiver vazio, exibe uma mensagem
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p>Nenhum item adicionado ainda.</p>';
        } else {
            // Se houver itens, itera sobre eles para criar os elementos na página
            cart.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                // Insere o HTML para cada item do carrinho
                itemElement.innerHTML = `
                    <button class="remove-item-btn" data-index="${index}"><i class="fas fa-times"></i></button>
                    <div class="cart-item-info">
                        <strong>${item.name}</strong>
                    </div>
                    <div class="cart-item-price">
                        R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}
                    </div>
                `;
                // Adiciona o novo item à lista
                cartItemsList.appendChild(itemElement);
                // Soma o preço do item ao total
                total += parseFloat(item.price);
            });
        }
        
        // Atualiza o texto do preço total e a contagem de itens no botão
        cartTotalPrice.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        cartCount.textContent = cart.length;
    }
}

// Adiciona os eventos de click somente após o DOM (Document Object Model) ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o botão que abre o carrinho
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    if (cartToggleBtn) {
        // Adiciona um evento de clique para exibir o modal do carrinho
        cartToggleBtn.addEventListener('click', () => {
            document.getElementById('cart-modal').style.display = 'flex';
            updateCart();
        });

        // Adiciona um evento de clique para fechar o modal
        document.querySelector('.modal .close-btn').addEventListener('click', () => {
            document.getElementById('cart-modal').style.display = 'none';
        });

        // Adiciona um evento de clique para fechar o modal ao clicar fora dele
        window.addEventListener('click', (e) => {
            if (e.target == document.getElementById('cart-modal')) {
                document.getElementById('cart-modal').style.display = 'none';
            }
        });
        
        // Adiciona um evento de clique ao botão de "Finalizar Pedido"
        document.querySelector('#checkout-btn').addEventListener('click', checkout);
        // Adiciona um evento de clique à lista de itens do carrinho (delegação de evento)
        document.getElementById('cart-items-list').addEventListener('click', (e) => {
            // Verifica se o clique foi no botão de remover item
            if (e.target.closest('.remove-item-btn')) {
                // Obtém o índice do item a ser removido a partir do atributo 'data-index'
                const indexToRemove = e.target.closest('.remove-item-btn').dataset.index;
                removeItemFromCart(indexToRemove);
            }
        });

        // Atualiza o carrinho na carga inicial da página
        updateCart();
    }
    
    // Seleciona todos os botões "Adicionar ao Pedido"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        // Adiciona um evento de clique a cada botão
        button.addEventListener('click', (e) => {
            // Encontra o item de catálogo mais próximo ao botão clicado
            const itemElement = e.target.closest('.catalog-item, .promotion-item');
            // Cria um objeto com os dados do item a partir dos atributos 'data-*' do HTML
            const item = {
                id: itemElement.dataset.id,
                name: itemElement.dataset.name,
                price: parseFloat(itemElement.dataset.price),
                category: itemElement.dataset.category
            };
            // Adiciona o item ao carrinho
            addItemToCart(item);
        });
    });

    // Evento para o novo formulário de WhatsApp
    const whatsappForm = document.getElementById('whatsapp-capture-form');
    if (whatsappForm) {
        // Adiciona um evento de submissão ao formulário de captura de WhatsApp
        whatsappForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário
            const whatsappNumber = document.getElementById('whatsapp-input').value;
            if (whatsappNumber.trim() !== '') {
                // Aqui você pode adicionar a lógica para enviar o número para o seu banco de dados ou API de marketing
                alert(`Obrigado! O número ${whatsappNumber} foi cadastrado com sucesso!`);
                whatsappForm.reset(); // Limpa o formulário após o envio
            }
        });
    }

    // --- Funcionalidade da Seção de Avaliações ---
    const reviewForm = document.getElementById('feedback-form');
    const ratingStars = document.querySelector('.rating-stars');
    const reviewsList = document.querySelector('.reviews-list');
    let userRating = 0;

    // Função para renderizar (exibir) as avaliações na tela
    function renderReviews() {
        reviewsList.innerHTML = '';
        // Obtém as avaliações e as avaliações do usuário do localStorage
        const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        const userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];

        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p>Nenhuma avaliação ainda. Seja o primeiro a comentar!</p>';
        } else {
            // Itera sobre as avaliações e cria os elementos HTML para cada uma
            reviews.forEach((review) => {
                const reviewItem = document.createElement('div');
                reviewItem.classList.add('review-item');
                reviewItem.innerHTML = `
                    <p class="review-text">"${review.text}"</p>
                    <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                    <p class="review-date">${review.date}</p>
                    <div class="review-actions">
                        ${userReviews.includes(review.id) ? `<button class="delete-review-btn" data-id="${review.id}"><i class="fas fa-trash"></i></button>` : ''}
                        <button class="like-review-btn" data-id="${review.id}"><i class="fas fa-thumbs-up"></i></button>
                        <span class="like-count">${review.likes || 0}</span>
                    </div>
                `;
                reviewsList.appendChild(reviewItem);
            });
        }
    }

    if (ratingStars) {
        // Adiciona um evento de clique para as estrelas de avaliação
        ratingStars.addEventListener('click', (e) => {
            const star = e.target.closest('span');
            if (star) {
                userRating = parseInt(star.dataset.value);
                // Atualiza a cor das estrelas de acordo com a nota selecionada
                document.querySelectorAll('.rating-stars span').forEach((s, index) => {
                    if (index < userRating) {
                        s.style.color = '#ffc107'; // Cor de estrela cheia
                    } else {
                        s.style.color = '#ccc'; // Cor de estrela vazia
                    }
                });
            }
        });
    }

    if (reviewForm) {
        // Adiciona um evento de submissão ao formulário de avaliação
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const reviewText = document.getElementById('review-text').value;
            if (reviewText.trim() === '' || userRating === 0) {
                alert('Por favor, escreva um comentário e selecione uma nota.');
                return;
            }

            // Cria um novo objeto de avaliação
            const newReview = {
                id: Date.now(),
                text: reviewText,
                rating: userRating,
                date: new Date().toLocaleDateString('pt-BR'),
                likes: 0
            };

            // Salva a nova avaliação no localStorage
            const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
            reviews.push(newReview);
            localStorage.setItem('reviews', JSON.stringify(reviews));

            // Salva o ID da avaliação do usuário para permitir que ele a apague depois
            const userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
            userReviews.push(newReview.id);
            localStorage.setItem('userReviews', JSON.stringify(userReviews));

            // Limpa o formulário e reseta as estrelas
            document.getElementById('review-text').value = '';
            userRating = 0;
            document.querySelectorAll('.rating-stars span').forEach(s => s.style.color = '#ccc');
            
            // Re-renderiza as avaliações
            renderReviews();
            alert('Sua avaliação foi enviada com sucesso!');
        });
    }

    // Adiciona um evento de clique à lista de avaliações para os botões de like e delete
    reviewsList.addEventListener('click', (e) => {
        // Lógica para deletar a avaliação
        if (e.target.closest('.delete-review-btn')) {
            const reviewIdToRemove = parseInt(e.target.closest('.delete-review-btn').dataset.id);
            const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
            const userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];

            // Verifica se o usuário tem permissão para apagar a avaliação
            if (userReviews.includes(reviewIdToRemove)) {
                if (confirm('Tem certeza que deseja remover esta avaliação?')) {
                    const newReviews = reviews.filter(review => review.id !== reviewIdToRemove);
                    localStorage.setItem('reviews', JSON.stringify(newReviews));
                    
                    const newUserReviews = userReviews.filter(id => id !== reviewIdToRemove);
                    localStorage.setItem('userReviews', JSON.stringify(newUserReviews));

                    renderReviews();
                }
            } else {
                alert('Você só pode apagar suas próprias avaliações.');
            }
        }

        // Lógica para dar like
        if (e.target.closest('.like-review-btn')) {
            const reviewIdToLike = parseInt(e.target.closest('.like-review-btn').dataset.id);
            const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
            const likedReviews = JSON.parse(localStorage.getItem('likedReviews')) || {};

            // Verifica se o usuário já curtiu esta avaliação
            if (likedReviews[reviewIdToLike]) {
                alert('Você já curtiu esta avaliação!');
                return;
            }

            // Encontra a avaliação a ser curtida e incrementa o contador de likes
            const reviewToUpdate = reviews.find(review => review.id === reviewIdToLike);
            if (reviewToUpdate) {
                reviewToUpdate.likes = (reviewToUpdate.likes || 0) + 1;
                likedReviews[reviewIdToLike] = true;
                
                // Salva os dados atualizados no localStorage
                localStorage.setItem('reviews', JSON.stringify(reviews));
                localStorage.setItem('likedReviews', JSON.stringify(likedReviews));
                renderReviews();
            }
        }
    });

    // Renderiza as avaliações na carga inicial da página
    renderReviews();
});

// ======================================================================
// EFEITO DE TRANSIÇÃO DE FADE PARA A PÁGINA INICIAL
// ======================================================================
const typingTextElement = document.getElementById('typing-text');
if (typingTextElement) {
    // Frases para o efeito de "digitação". Você pode editar as frases aqui
    const phrases = [
        "Seu carro merece o melhor brilho!",
        "Cuide do seu veículo com a gente.",
        "Limpeza impecável, por dentro e por fora.",
        "Detalhes que fazem a diferença."
    ];
    let phraseIndex = 0;

    // Função para o efeito de "fade in" (aparecer)
    function fadeIn() {
        typingTextElement.textContent = phrases[phraseIndex];
        let opacity = 0;
        const interval = setInterval(() => {
            if (opacity < 1) {
                opacity += 0.05;
                typingTextElement.style.opacity = opacity;
            } else {
                clearInterval(interval);
                setTimeout(fadeOut, 2000); // Pausa visível
            }
        }, 50);
    }

    // Função para o efeito de "fade out" (desaparecer)
    function fadeOut() {
        let opacity = 1;
        const interval = setInterval(() => {
            if (opacity > 0) {
                opacity -= 0.05;
                typingTextElement.style.opacity = opacity;
            } else {
                clearInterval(interval);
                phraseIndex = (phraseIndex + 1) % phrases.length; // Avança para a próxima frase ou volta para a primeira
                setTimeout(fadeIn, 500); // Pausa entre as transições
            }
        }, 50);
    }
    
    // Inicia o efeito
    typingTextElement.style.opacity = 0; // Garante que começa invisível
    fadeIn();
}
