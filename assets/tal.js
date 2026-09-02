/* TheAdvisoryLetter.org — jump-to-section list.
 *
 * On a long page or article this builds a small contents list from the H2
 * headings already in the text. It goes into the sticky rail beside the
 * reading column when there is one, and falls back to sitting above the first
 * heading when there is not. Nothing to maintain: add or rename a section
 * heading in Ghost and the list follows.
 *
 * Turn it off site-wide under Design > Site-wide > "Show jump to section
 * list", or on one page by setting data-tal-jump="off" on the content block.
 */
(function () {
    'use strict';

    var content = document.querySelector('.gh-content');
    if (!content || content.dataset.talJump === 'off') {
        return;
    }

    var headings = [].slice.call(content.querySelectorAll('h2[id]'));
    if (headings.length < 3) {
        return;
    }

    /* The rail is the preferred home: it keeps the contents visible while the
       reader scrolls instead of pushing the article down the screen. It also
       carries the two pieces of wording this script needs, translated by the
       template, so no English is written into the JavaScript. */
    var slot = document.querySelector('.tal-rail-slot[data-tal-rail]');
    var data = slot ? slot.dataset : {};

    var nav = document.createElement('nav');
    nav.className = 'tal-jump';
    nav.setAttribute('aria-label', data.talJumpLabel || 'Sections on this page');

    var label = document.createElement('p');
    label.className = 'tal-jump-title';
    label.textContent = data.talJumpTitle || 'On this page';
    nav.appendChild(label);

    var list = document.createElement('ol');
    var links = [];

    headings.forEach(function (heading) {
        var item = document.createElement('li');
        var link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = (heading.textContent || '').trim();
        item.appendChild(link);
        list.appendChild(item);
        links.push(link);
    });

    nav.appendChild(list);

    if (slot) {
        slot.appendChild(nav);
    } else {
        content.insertBefore(nav, headings[0]);
    }

    /* Mark whichever section is on screen. Guarded so a browser without
       IntersectionObserver simply gets a plain list. */
    if (!slot || typeof IntersectionObserver !== 'function') {
        return;
    }

    var current = null;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }

            var index = headings.indexOf(entry.target);
            if (index < 0 || links[index] === current) {
                return;
            }

            if (current) {
                current.classList.remove('is-current');
            }

            current = links[index];
            current.classList.add('is-current');
        });
    }, {rootMargin: '-10% 0px -70% 0px', threshold: 0});

    headings.forEach(function (heading) {
        observer.observe(heading);
    });
}());
