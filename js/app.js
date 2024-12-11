$(document).ready(function() {
    // Page index.html - Sélection des catégories et des niveaux
    $('input[type="radio"]').on('change', function() {
        const category = $(this).closest('.category').find('h2').text(); // Catégorie sélectionnée
        const level = $(this).val(); // Niveau sélectionné

        // Sauvegarder dans localStorage
        localStorage.setItem('category', category);
        localStorage.setItem('level', level);

        // Afficher le modal pour entrer le prénom après la sélection de la catégorie et du niveau
        $('#usernameModal').modal('show'); // Afficher le modal
    });

    // Soumettre le prénom et rediriger vers la page summary.html
    $('#submitName').click(function() {
        const username = $('#username').val();

        if (username) {
            // Sauvegarder le prénom dans localStorage
            localStorage.setItem('username', username); 

            // Fermer le modal
            $('#usernameModal').modal('hide');

            // Rediriger vers la page récapitulative (summary.html)
            window.location.href = 'summary.html';  // Redirection vers summary.html
        } else {
            alert('Veuillez entrer un prénom.');
        }
    });
});

$(document).ready(function() {
    // Page summary.html - Affichage des informations
    const categoryOnSummary = localStorage.getItem('category');
    const levelOnSummary = localStorage.getItem('level');
    const usernameOnSummary = localStorage.getItem('username');

    // Affichage des informations sur la page récapitulative
    if ($('#quizCategory').length) {
        $('#quizCategory').text(categoryOnSummary || 'Non sélectionné');
        $('#quizLevel').text(`Niveau ${levelOnSummary || 'Non sélectionné'}`);
        $('#welcomeMessage').text(`${usernameOnSummary || 'Utilisateur'}, vous allez pouvoir démarrer ce Quizz !!!`);

        // Mise à jour de l'image de la catégorie
        let imageUrl = '';
        switch (categoryOnSummary) {
            case 'Applications Web':
                imageUrl = 'img/web.jpg';
                break;
            case 'JavaScript':
                imageUrl = 'img/javascript.png';
                break;
            case 'Le XXème Siècle':
                imageUrl = 'img/dates20.jpg';
                break;
            case 'Nintendo':
                imageUrl = 'img/nintendo.jpg';
                break;
            case 'Trouver le Nombre':
                imageUrl = 'img/nombres.jpg';
                break;
            case 'Microsoft':
                imageUrl = 'img/microsoft.jpg';
                break;
            case 'PHP':
                imageUrl = 'img/PHP.jpg';
                break;
            case 'Méandres d\'Internet':
                imageUrl = 'img/internet.jpg';
                break;
            default:
                imageUrl = ''; // Image par défaut si non trouvée
                break;
        }
        $('#categoryImage').attr('src', imageUrl);
    }

    // Redirection vers quizPage.html
    $('#startQuiz').click(function() {
        window.location.href = 'quizPage.html';  // Redirection vers quizPage.html
    });
});

$(document).ready(function() {
    // Récupérer la catégorie et le niveau depuis localStorage
    const category = localStorage.getItem('category');
    const level = localStorage.getItem('level');

    // Affichage des informations sur la page
    $('#quizCategory').text(category);
    $('#quizLevel').text(`Niveau ${level}`);

    // Définir le chemin du fichier JSON en fonction de la catégorie sélectionnée
    let jsonFile = '';
    switch (category) {
        case 'Applications Web':
            jsonFile = 'json/quizzweb.json';
            break;
        case 'JavaScript':
            jsonFile = 'json/quizzjavascript.json';  // Fichier JSON pour JavaScript
            break;
        case 'Le XXème Siècle':
            jsonFile = 'json/quizzdates20.json';
            break;
        case 'Nintendo':
            jsonFile = 'json/quizznintendo.json';
            break;
        case 'Trouver le Nombre':
            jsonFile = 'json/quizznombres.json';
            break;
        case 'Microsoft':
            jsonFile = 'json/quizzmicrosoft.json';
            break;
        case 'PHP':
            jsonFile = 'json/quizzphp.json';
            break;
        case 'Méandres d\'Internet':
            jsonFile = 'json/quizzinternet.json';
            break;
        default:
            jsonFile = ''; // Image par défaut si non trouvée
            break;
    }

    // Charger le fichier JSON correspondant à la catégorie et au niveau
    $.ajax({
        url: jsonFile,
        method: 'GET',
        success: function(data) {
            console.log('Données du quiz chargées :', data);  // Vérification que le fichier JSON est bien chargé

            // Vérification si les questions existent
            let questions = data.quizz[level.toLowerCase()];  // 'débutant', 'confirmé', 'expert'
            if (!questions || questions.length === 0) {
                console.error("Aucune question trouvée dans le fichier JSON pour le niveau sélectionné.");
                return;  // Si pas de questions, ne continuez pas
            }

            let currentQuestionIndex = 0; // Index de la question courante

            function loadQuestion() {
                let currentQuestion = questions[currentQuestionIndex];
                console.log('Chargement de la question:', currentQuestion);  // Vérification du contenu de la question

                // Afficher la question
                $('#quizQuestion').html(`
                    <h3 id="questionText">Question ${currentQuestionIndex + 1}: ${currentQuestion.question}</h3>
                `);

                // Réinitialiser l'anecdote (au cas où elle serait déjà présente)
                $('#anecdote').html('');

                // Réponses à afficher
                let optionsHtml = '';
                currentQuestion.propositions.forEach(function(option) {
                    optionsHtml += `<div class="draggable-answer btn btn-warning" data-answer="${option}">${option}</div>`;
                });

                $('#questionOptions').html(optionsHtml);  // Insérer les réponses dans le DOM

                // Draggable setup
                $(".draggable-answer").draggable({
                    helper: "clone"  // Créer une copie de l'élément pendant le drag
                });

                // Droppable setup
                $("#answerZone").droppable({
                    accept: ".draggable-answer",
                    drop: function(event, ui) {
                        const droppedAnswer = ui.helper[0].textContent;  // Récupérer la réponse déposée
                        $('#droppedAnswer').text(droppedAnswer);  // Afficher la réponse dans la zone

                        // Validation de la réponse
                        if (ui.helper[0].dataset.answer === currentQuestion.réponse) {
                            $(this).css("background-color", "green");
                            ui.helper.css("background-color", "green");

                            // Afficher l'anecdote immédiatement après la bonne réponse
                            if (currentQuestion.anecdote) {
                                $('#anecdote').html(`<p><strong>Anecdote:</strong> ${currentQuestion.anecdote}</p>`);
                            }
                            $('#nextButton').prop("disabled", false); // Activer le bouton Suivant
                        } else {
                            $(this).css("background-color", "red");
                            $('#nextButton').prop("disabled", false); // Activer le bouton Suivant
                            // Afficher la bonne réponse en vert
                            $(".draggable-answer[data-answer='" + currentQuestion.réponse + "']").css("background-color", "green");
                        }

                        // Désactiver le drag des éléments après réponse
                        $(".draggable-answer").draggable("disable");
                    }
                });
            }

            // Charger la première question
            loadQuestion();

            // Gérer l'événement "Suivant" pour la question suivante
            $('#nextButton').click(function() {
                $('#nextButton').prop("disabled", true);  // Désactiver le bouton "Suivant" jusqu'à la prochaine réponse
                currentQuestionIndex++;

                // Si on a encore des questions à afficher
                if (currentQuestionIndex < questions.length) {
                    loadQuestion();  // Charger la question suivante
                    $('#answerZone').css("background-color", "");  // Réinitialiser la couleur de la zone
                    $('#droppedAnswer').text('Déposez votre réponse ici'); // Réinitialiser le texte
                    $('#anecdote').text('');  // Réinitialiser l'anecdote
                } else {
                    // Fin du quiz
                    alert('Félicitations, vous avez terminé le quiz !');
                    // Vous pouvez rediriger vers une autre page ou réinitialiser le quiz
                }
            });
        },
        error: function(error) {
            console.error('Erreur lors du chargement des données du quiz:', error);
        }
    });
});

