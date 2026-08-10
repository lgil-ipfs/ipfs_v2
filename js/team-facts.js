/* ============================================================
   IBERIAN PACIFIC — "Beyond the Bio" fact list
   Replaces the step-through quiz format: every question is listed
   at once, and clicking any option reveals the right answer inline
   (no progress bar, no scoring, no results screen).
   ============================================================ */
(function () {
  'use strict';

  function renderTeamFacts(containerId, config) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var firstName = config.firstName;
    var questions = config.questions || [];
    var letters = ['A', 'B', 'C', 'D'];

    var itemsHtml = questions.map(function (q, qi) {
      var optionsHtml = q.options.map(function (opt, i) {
        return '<button type="button" class="tf-option" data-index="' + i + '">' +
          '<span class="tf-option-letter">' + letters[i] + '</span><span>' + opt + '</span></button>';
      }).join('');

      return (
        '<div class="tf-item" data-qindex="' + qi + '">' +
          '<div class="tf-question">' + (qi + 1) + '. ' + q.question + '</div>' +
          '<div class="tf-options" role="group" aria-label="Guess ' + (qi + 1) + '">' + optionsHtml + '</div>' +
          '<div class="tf-reveal" id="tf-reveal-' + containerId + '-' + qi + '"></div>' +
        '</div>'
      );
    }).join('');

    container.innerHTML =
      '<div class="tf-header">' +
        '<h2>How well do you know ' + firstName + '?</h2>' +
        '<p>Beyond the professional bio — take a guess at each one below. The answer reveals itself as soon as you pick.</p>' +
      '</div>' +
      '<div id="tf-live-' + containerId + '" class="sr-only" aria-live="polite"></div>' +
      '<div class="tf-list">' + itemsHtml + '</div>';

    var liveRegion = container.querySelector('#tf-live-' + containerId);

    questions.forEach(function (q, qi) {
      var item = container.querySelector('.tf-item[data-qindex="' + qi + '"]');
      var optionButtons = item.querySelectorAll('.tf-option');
      var reveal = item.querySelector('.tf-reveal');
      var answered = false;

      optionButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (answered) return;
          answered = true;

          var selected = parseInt(btn.getAttribute('data-index'), 10);
          var isCorrect = selected === q.correctIndex;

          optionButtons.forEach(function (b) {
            var i = parseInt(b.getAttribute('data-index'), 10);
            b.disabled = true;
            if (i === q.correctIndex) b.classList.add('is-correct');
            if (i === selected && !isCorrect) b.classList.add('is-incorrect');
          });

          var label = isCorrect ? 'Correct!' : 'Not quite!';
          var icon = isCorrect ? '✓' : '✗';
          reveal.className = 'tf-reveal show ' + (isCorrect ? 'is-correct' : 'is-incorrect');
          reveal.innerHTML = '<span class="tf-reveal-icon" aria-hidden="true">' + icon + '</span>' +
            '<span><strong>' + label + '</strong> ' + q.explanation + '</span>';

          if (liveRegion) liveRegion.textContent = label + ' ' + q.explanation;
        });
      });
    });
  }

  window.renderTeamFacts = renderTeamFacts;
})();
