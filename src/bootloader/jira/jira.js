import HashMap from 'hashmap';
import ButtonState from '../../button/button.js';
import * as observer from 'src/utils/observer';
import { generateTaskNotes } from '../../utils/quill';
import '../global.less';
import './jira.less';

const buttons = new HashMap();

function createObserver() {
  observer
    .create('#ghx-detail-view, #issue-content, #jira-frontend, [role=dialog]')
    .onAdded(createButton)
    .onRemoved(removeButton)
    .start();
}

function createButton(node) {
  if (document.querySelector('.command-bar')) {
    createButtonOld(node);
  } else {
    createButtonNew(node);
  }
}

function createButtonNew(node) {
  const state = new ButtonState({
    task: {},
    link: null,
    anchor: 'screen',
  });

  let buttonEl;
  const actionsElSelector = '#jira-issue-header ';

  const titleObserver = observer
    .create('[spacing="comfortable"] h1', node)
    .onAdded(function(titleEl) {
      const name = titleEl.innerText;
      state.task.name = name;

      let link = document.querySelector('[spacing="comfortable"] a').href;
      link = ~link.indexOf('secure/BrowseProjects.jspa')
        ? window.location.href
        : link;
      state.task.notes = generateTaskNotes('JIRA', link);
      state.link = link;

      buttonEl = state.button.render().el;
    })
    .start();

  const actionsObserver = observer
    .create(actionsElSelector, node)
    .onAdded(function(actionsEl) {
      actionsEl.appendChild(buttonEl);
    })
    .start();

  buttons.set(node, {
    state,
    title: titleObserver,
    actions: actionsObserver,
  });
}

function createButtonOld(node) {
  const state = new ButtonState({
    task: {},
    link: null,
    anchor: 'screen',
  });

  const titleObserver = observer
    .create('#summary-val', node)
    .onAdded(function(titleEl) {
      const name = titleEl.innerText;
      state.task.name = name;

      let link = document.querySelector('#key-val, #issuekey-val a').href;
      link = ~link.indexOf('secure/BrowseProjects.jspa')
        ? window.location.href
        : link;
      state.task.notes = generateTaskNotes('JIRA', link);
      state.link = link;

      const buttonEl = state.button.render().el;
      titleEl.appendChild(buttonEl);
    })
    .start();

  buttons.set(node, {
    state,
    title: titleObserver,
  });
}

function removeButton(node) {
  const button = buttons.get(node);

  if (button) {
    button.state.remove();
    button.title.stop();
    if (button.actions) {
      button.actions.stop();
    }
  }
}

function handleError(error) {
  console.error(error);
}

if (!ButtonState.isLoaded()) {
  ButtonState.initialize()
    .then(createObserver)
    .catch(handleError);
}
