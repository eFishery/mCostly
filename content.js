const noOp = () => {};
const nuLL = () => null;
const d = new Date();
const addHours = (n) => {
  d.setHours(...n);
  return d.getTime() | 0;
};
const arrayChunks = (array, chunk_size) =>
  Array(Math.ceil(array.length / chunk_size))
    .fill()
    .map((_, index) => index * chunk_size)
    .map((begin) => array.slice(begin, begin + chunk_size));
const calculateCost = ({ hourlyRate, durations }) => hourlyRate * durations;

const toRupiah = (num) => {
  if (isNaN(num)) return 'Not a Number'
  let rupiah = "";
  const reverseNumber = num
    .toString()
    .split("")
    .reverse()
    .join("");
  const arrReverseNumber = [...Array(reverseNumber.length).keys()];
  arrReverseNumber.map(index => {
    if (index % 3 === 0) rupiah += `${reverseNumber.substr(index, 3)}.`
  });

  return `Rp${
    rupiah.split("", rupiah.length - 1)
    .reverse()
    .join("")
  }`;
};

const id = { costly: "xyz-costly" };

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
    tag.appendChild(document.createTextNode(k === "cost" ? toRupiah(v) : v));
    contentWrapper.appendChild(tag);
  });

  element.appendChild(contentWrapper);

  return element;
}

function getDurations(timeStr) {
  const nTime = (timeStr || "").split("").filter((n) => /\d+/.test(n));

  const [d1, d2] = {
    [true]: [0, 0],
    [nTime.length === 6]: arrayChunks(nTime, 3).map((d) => addHours(d)),
    [nTime.length === 7]: arrayChunks(nTime.reverse(), 3)
      .map((d) => addHours(d))
      .reverse(),
    [nTime.length === 8]: arrayChunks(nTime, 4).map((d) => addHours(d)),
  }.true;

  return Math.floor((d2 - d1) / (1000 * 60 * 60));
}

function makeViewCostly() {
  const targetDialog = Promise.resolve()
    .then(
      () =>
        document.querySelector("[data-open-edit-note]").childNodes[0]
          .childNodes[2]
    )
    .catch(nuLL);


  targetDialog &&
    targetDialog
      .then((node) => {
        const timeStr =
          node.childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[2]
            .firstChild.textContent;
        const durations = getDurations(timeStr);
        const costly = Message({
          title: "Estimated Meeting Cost is ",
          cost: calculateCost({
            hourlyRate: 560000,
            durations: durations | 0,
          }),
        });

        node.childNodes[1].append(costly);
      })
      .catch(noOp);
}

setInterval(() => !document.getElementById(id.costly) && makeViewCostly(), 500);
