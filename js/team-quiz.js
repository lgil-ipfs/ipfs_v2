/* ============================================================
   IBERIAN PACIFIC — "Beyond the Bio" team quiz engine
   Visual/interaction language modeled on Student Financial's
   embedded article quiz (studentfinancial/js/quiz.js), rebuilt
   standalone here — the Student Financial quiz system itself is
   untouched.
   ============================================================ */
(function () {
  'use strict';

  function TeamQuiz(containerId, config) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.personName = config.personName;
    this.firstName = config.firstName;
    this.questions = config.questions || [];
    this.meetTeamHref = config.meetTeamHref || '/our-team.html';
    this.bookHref = config.bookHref || 'https://cal.com/iberian-pacific';
    this.storageKey = 'ip-team-quiz-' + (config.slug || this.firstName.toLowerCase());

    this.state = this.loadState() || { index: 0, score: 0, answers: [] };

    this.render();
  }

  TeamQuiz.prototype.loadState = function () {
    try {
      var raw = sessionStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  TeamQuiz.prototype.saveState = function () {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) { /* sessionStorage unavailable — quiz still works, just won't resume */ }
  };

  TeamQuiz.prototype.resetState = function () {
    this.state = { index: 0, score: 0, answers: [] };
    try { sessionStorage.removeItem(this.storageKey); } catch (e) { /* noop */ }
  };

  TeamQuiz.prototype.render = function () {
    var total = this.questions.length;
    this.container.innerHTML =
      '<div class="tq-header">' +
        '<span class="tq-sample-badge">Sample content &mdash; pending team approval</span>' +
        '<h2>How well do you know ' + this.firstName + '?</h2>' +
        '<p>Beyond the professional bio, see if you can guess a few of ' + this.firstName + '&rsquo;s favourites, interests, and adventures.</p>' +
      '</div>' +
      '<div id="tq-live" class="sr-only" aria-live="polite"></div>' +
      '<div id="tq-question-area"></div>' +
      '<div id="tq-results-area" class="tq-results" hidden></div>';

    this.liveRegion = this.container.querySelector('#tq-live');
    this.questionArea = this.container.querySelector('#tq-question-area');
    this.resultsArea = this.container.querySelector('#tq-results-area');

    if (this.state.index >= total) {
      this.showResults();
    } else {
      this.showQuestion(this.state.index);
    }
  };

  TeamQuiz.prototype.showQuestion = function (index) {
    var q = this.questions[index];
    var total = this.questions.length;
    var letters = ['A', 'B', 'C', 'D'];
    var savedAnswer = this.state.answers[index];

    var optionsHtml = q.options.map(function (opt, i) {
      return '<button type="button" class="tq-option" role="radio" aria-checked="false" data-index="' + i + '">' +
        '<span class="tq-option-letter">' + letters[i] + '</span><span>' + opt + '</span></button>';
    }).join('');

    this.questionArea.innerHTML =
      '<div class="tq-question">' +
        '<div class="tq-progress-track"><div class="tq-progress-fill" style="width:' + Math.round((index / total) * 100) + '%"></div></div>' +
        '<div class="tq-progress-label">Question ' + (index + 1) + ' of ' + total + '</div>' +
        '<p class="tq-question-text">' + q.question + '</p>' +
        '<div class="tq-options" role="radiogroup" aria-label="Question ' + (index + 1) + ' of ' + total + '">' + optionsHtml + '</div>' +
        '<div class="tq-feedback" id="tq-feedback"></div>' +
        '<div class="tq-footer">' +
          '<button type="button" class="btn btn-primary tq-next-btn" id="tq-next" hidden>' +
            (index === total - 1 ? 'See Results' : 'Next Question') +
          '</button>' +
        '</div>' +
      '</div>';

    var self = this;
    var optionButtons = this.questionArea.querySelectorAll('.tq-option');
    var nextBtn = this.questionArea.querySelector('#tq-next');
    var feedback = this.questionArea.querySelector('#tq-feedback');

    if (savedAnswer !== undefined) {
      this.revealAnswer(optionButtons, feedback, nextBtn, q, savedAnswer, false);
    } else {
      optionButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var selected = parseInt(btn.getAttribute('data-index'), 10);
          self.handleAnswer(index, selected, optionButtons, feedback, nextBtn, q);
        });
      });
    }

    nextBtn.addEventListener('click', function () {
      self.state.index = index + 1;
      self.saveState();
      if (self.state.index >= total) {
        self.showResults();
      } else {
        self.showQuestion(self.state.index);
      }
    });
  };

  TeamQuiz.prototype.handleAnswer = function (index, selected, optionButtons, feedback, nextBtn, q) {
    var isCorrect = selected === q.correctIndex;
    this.state.answers[index] = selected;
    if (isCorrect) this.state.score++;
    this.saveState();
    this.revealAnswer(optionButtons, feedback, nextBtn, q, selected, true);
  };

  TeamQuiz.prototype.revealAnswer = function (optionButtons, feedback, nextBtn, q, selected, announce) {
    var isCorrect = selected === q.correctIndex;
    optionButtons.forEach(function (btn) {
      var i = parseInt(btn.getAttribute('data-index'), 10);
      btn.disabled = true;
      btn.setAttribute('aria-checked', i === selected ? 'true' : 'false');
      if (i === q.correctIndex) btn.classList.add('is-correct');
      if (i === selected && !isCorrect) btn.classList.add('is-incorrect');
    });

    var label = isCorrect ? 'Correct!' : 'Not quite!';
    var icon = isCorrect ? '✓' : '✗';
    feedback.className = 'tq-feedback show ' + (isCorrect ? 'is-correct' : 'is-incorrect');
    feedback.innerHTML = '<span class="tq-feedback-icon" aria-hidden="true">' + icon + '</span>' +
      '<span><strong>' + label + '</strong> ' + q.explanation + '</span>';

    nextBtn.hidden = false;

    if (announce && this.liveRegion) {
      this.liveRegion.textContent = label + ' ' + q.explanation;
    }
  };

  TeamQuiz.prototype.showResults = function () {
    this.questionArea.innerHTML = '';
    this.questionArea.hidden = true;
    this.resultsArea.hidden = false;

    var total = this.questions.length;
    var score = this.state.score;
    var msg;
    if (score === total) {
      msg = 'You know ' + this.firstName + ' inside and out.';
    } else if (score >= total / 2) {
      msg = 'You now know a little more about ' + this.firstName + ' beyond their professional bio.';
    } else {
      msg = 'There is always more to learn about the people at Iberian Pacific.';
    }

    this.resultsArea.innerHTML =
      '<div class="tq-results-score">You got ' + score + ' out of ' + total + '!</div>' +
      '<p class="tq-results-copy">' + msg + '</p>' +
      '<div class="tq-results-actions">' +
        '<a class="tq-outline-btn" href="' + this.meetTeamHref + '">Meet the rest of the team</a>' +
        '<a class="btn btn-primary" href="' + this.bookHref + '" target="_blank" rel="noopener noreferrer">Book a conversation with ' + this.firstName + '</a>' +
      '</div>' +
      '<button type="button" class="tq-retake-btn" id="tq-retake">Retake the quiz</button>';

    var self = this;
    this.resultsArea.querySelector('#tq-retake').addEventListener('click', function () {
      self.resetState();
      self.resultsArea.hidden = true;
      self.questionArea.hidden = false;
      self.showQuestion(0);
    });

    if (this.liveRegion) {
      this.liveRegion.textContent = 'Quiz complete. You got ' + score + ' out of ' + total + '.';
    }
  };

  window.TeamQuiz = TeamQuiz;
})();
