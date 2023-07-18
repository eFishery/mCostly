/// <reference path="chrome.d.ts" />
const noOp = () => { };
const nuLL = () => null;
const d = new Date();

const toTime = (n) => {
  const [hours, minutes] = n;
  const adjustedHours = hours >= 12 ? hours - 12 : hours; // Adjust hours if greater than or equal to 12
  const adjustedMinutes = minutes || 0;
  d.setHours(adjustedHours, adjustedMinutes);
  return d.getTime() | 0;
};

const arrayChunks = (array, chunk_size) =>
  Array(Math.ceil(array.length / chunk_size))
    .fill()
    .map((_, index) => index * chunk_size)
    .map((begin) => array.slice(begin, begin + chunk_size));

const calculateCost = ({ hourlyRate, durations }) => {
  if (durations < 1) {
    return 0;
  }
  const hourlyRateInMinutes = hourlyRate / 60; // Convert hourly rate to minutes
  return hourlyRateInMinutes * durations;
};

const id = {
  costly: "mCostly",
  allMeetingEvents: 'div[role="button"][data-eventchip][data-opens-details="true"][data-eventid][data-focusable][jsaction][jscontroller]', // querySelectorAll
  openEditMeetingEvent: '[data-open-edit-note]',
};

function Message(props) {
  const element = document.createElement("div");
  const iconWrapper = document.createElement("div");
  const contentWrapper = document.createElement("div");

  iconWrapper.style.paddingLeft = "28px";
  iconWrapper.style.width = "40px";
  iconWrapper.style.maxHeight = "52px";
  const icon = document.createElement("i");
  icon.setAttribute("class", "google-material-icons");
  icon.innerHTML = "attach_money";
  iconWrapper.appendChild(icon);
  element.id = id.costly;
  element.style.width = "100%";
  element.style.display = "flex";
  element.style.alignItems = "center";
  element.style.minHeight = "40px";
  element.style.paddingRight = "16px";
  element.style.color = "rgb(60,64,67)";

  element.appendChild(iconWrapper);

  contentWrapper.style.letterSpacing = ".2px";

  Object.entries(props).forEach(([k, v]) => {
    const tag = document.createElement(k === "cost" ? "strong" : "span");
    if (k === "cost") {
      tag.style.color = "rgb(234,67,53)";
      tag.style.padding = "0 0 0 0.1em";
    }
    tag.appendChild(document.createTextNode(v));
    contentWrapper.appendChild(tag);
  });

  element.appendChild(contentWrapper);

  return element;
}

const getDurations = (timeStr) => {
  // originally using U+2013 `–` and `-` is U+002d
  const [d1, d2] = (timeStr || "")
    .split("–")
    .map((s) => {
      const re = /(am|pm)/;
      const hasPM = /pm/.test(s);
      const [h, m] = s
        .replace(re, "")
        .split(":")
        .map((n) => n | 0);
      return hasPM && h <= 12 ? [h + 12, m] : [h, m];
    })
    .map(toTime);

  return Math.floor((d2 - d1) / (1000 * 60));
};

const getOptions = () =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.get(["hourlyRate", "currency"], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });

function makeViewCostly() {
  // when user click event at calendar.google.com
  const selector = () => document.querySelector(id.openEditMeetingEvent);
  const getNode = () => selector().childNodes[0].childNodes[2];
  const getTimeNode = () =>
    getNode().childNodes[0].childNodes[1].childNodes[0].childNodes[1]
      .childNodes[2].firstChild.textContent;
  const getParticipantsNode = () =>
    document.querySelector("[data-show-working-location-actions]")
      .firstElementChild.childNodes[1].firstChild;

  // get options first
  getOptions()
    .then((options) => ({
      options,
      node: getNode(),
      timeNode: getTimeNode(),
      participantsNode: getParticipantsNode(),
    }))
    .then(({ options, node, timeNode, participantsNode }) => {
      // participantsNode.childNodes.forEach((n) => console.log(n.textContent));
      const durations = getDurations(timeNode);
      const costEstimation = calculateCost({
        hourlyRate: options.hourlyRate | 0,
        durations: durations | 0,
      });

      const [currency, countryCode] = options.currency.split(".");

      const formatCurrency = new Intl.NumberFormat(countryCode || "en-US", {
        style: "currency",
        currency: currency || "USD",
        currencyDisplay: "symbol",
      }).format;

      // formatCurrency_(options.currency.split('.')[1] || "USD")

      const costNode = Message({
        title: "Hourly Meeting Cost is ",
        cost: formatCurrency(costEstimation),
      });

      node.childNodes[1].append(costNode);

      if (participantsNode.firstChild.textContent) {
        const participants =
          (participantsNode.firstChild.textContent || "").replace(/\D+/, "") |
          1;
        const participantNode = document.createElement("strong");
        participantNode.style.color = "rgb(234,67,53)";
        participantNode.textContent = formatCurrency(
          costEstimation * participants
        );
        participantsNode.firstChild.textContent += " - ";
        participantsNode.firstChild.append(participantNode);
      }
    })
    .catch(noOp);
}

const findElement = selector => {
  return new Promise((resolve) => {
    function checkElement() {
      const element = selector();

      if (
        element ||
        (Array.isArray(element) && element.length > 0)
      ) {
        // Element found, resolve the Promise with the element
        resolve(element);
      } else {
        // Element not found, continue searching with the next animation frame
        requestAnimationFrame(checkElement);
      }
    }

    requestAnimationFrame(checkElement);
  });
}

// TODO make smoothly
// 1. find all nodes of event with findElement - it will be return Node or NodeList ✅
window.addEventListener('load', () => {
  const findAllMeetingEvents = () => document.querySelectorAll(id.allMeetingEvents)

  const TODO = openEdit => {
    console.info(`
    found open-edit meeting and need to attach makeViewCostly here with approaches:
    * MutationObserver
    * RAF - requestAnimationFrame
    * or Your Suggestions
  `, openEdit)

    let intervalId

    const observer = new MutationObserver(
      mutations => {
        console.log("o", openEdit.querySelector(`[id=${id.costly}]`))
        mutations.forEach(
          mutationNode => console.info(mutationNode.target.querySelector(`[id=${id.costly}]`))
        )
      }
    )
    // when childList is true it will be call mutation callback - updated new records of mutations
    observer.observe(openEdit, { childList: true })

    // maybe we need to handle intervalId
    intervalId = setInterval(
      () => {
        if (!openEdit.querySelector(`div[id="${id.costly}"]`)) {
          makeViewCostly()
        }
      },
      100
    )
  }

  const handleClickMeetingEvent = () =>
    findElement(() => document.querySelector(id.openEditMeetingEvent)).then(TODO)

  const addHandleClickToAllMeetings = allMeetings =>
    allMeetings.forEach(
      meeting => meeting.addEventListener('click',
        handleClickMeetingEvent
      )
    )

  findElement(findAllMeetingEvents)
    .then(Array.from)
    .then(addHandleClickToAllMeetings)
})
