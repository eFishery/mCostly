/// <reference path="chrome.d.ts" />

const noOp = () => { };
const nuLL = () => null;
const d = new Date();

const toTime = (n) => {
  d.setHours(...n);
  return d.getTime() | 0;
};

const arrayChunks = (array, chunk_size) =>
  Array(Math.ceil(array.length / chunk_size))
    .fill()
    .map((_, index) => index * chunk_size)
    .map((begin) => array.slice(begin, begin + chunk_size));

const calculateCost = ({ hourlyRate, durations }) => hourlyRate * durations;

const id = { costly: "mCostly" };

function Message({ currency, ...props }) {
  const element = document.createElement("div");
  const iconWrapper = document.createElement("div");
  const contentWrapper = document.createElement("div");
  const [_currency, countryCode] = currency.split('.')
  const formatCurrency = new Intl.NumberFormat(countryCode, {
    style: 'currency',
    currency: _currency,
    currencyDisplay: 'symbol',
  }).format

  iconWrapper.style.paddingLeft = "28px";
  iconWrapper.style.width = "40px";
  iconWrapper.style.maxHeight = "52px";
  const icon = document.createElement("i");
  icon.setAttribute("class", "google-material-icons");
  icon.innerHTML = "attach_money";
  iconWrapper.appendChild(icon);
  element.id = id.costly;
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
    tag.appendChild(document.createTextNode(k === "cost" ? formatCurrency(v) : v));
    contentWrapper.appendChild(tag);
  });

  element.appendChild(contentWrapper);

  return element;
}

const getDurations = (timeStr) => {
  const [d1, d2] = (timeStr || "")
    .split("–") // `–` is not equal `-`
    .map(s => {
      const re = /(am|pm)/
      const hasPM = /pm/.test(s)
      const [h, m] = s.replace(re, '').split(":").map(n => n | 0)
      return hasPM && h < 12 ? [h + 12, m] : [h, m]
    })
    .map(toTime)

  return Math.floor((d2 - d1) / (1000 * 60 * 60));
}

const getOptions = () => chrome.storage.sync.get(['hourlyRate', 'currency'])

function makeViewCostly() {
  // when user click event at calendar.google.com
  const selector = () => document.querySelector("[data-open-edit-note]")
  const getNode = () => selector().childNodes[0].childNodes[2]
  const getTimeNode = () =>
    getNode().childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[2]
      .firstChild.textContent;

  // get options first
  getOptions()
    .then(options => ({
      options,
      node: getNode(),
      timeNode: getTimeNode()
    }))
    .then(({ options, node, timeNode }) => {
      const durations = getDurations(timeNode);
      const costly = Message({
        title: "Estimated Meeting Cost is ",
        cost: calculateCost({
          hourlyRate: options.hourlyRate | 0,
          durations: durations | 0,
        }),
        currency: options.currency || 'id-ID'
      });

      node.childNodes[1].append(costly);
    })
    .catch(noOp)
}

const listener = () =>
  setInterval(() => !document.getElementById(id.costly) && makeViewCostly(), 300);

listener()
