const noOp = () => {};
const nuLL = () => null;
const d = new Date();
const getTime = (n) => {
  d.setHours(...n);
  return d.getTime() | 0;
};
const arrayChunks = (array, chunk_size) =>
  Array(Math.ceil(array.length / chunk_size))
    .fill()
    .map((_, index) => index * chunk_size)
    .map((begin) => array.slice(begin, begin + chunk_size));
const calculateCost = ({ hourlyRate, durations }) => hourlyRate * durations;

const id = { costly: "xyz-costly" };

function Message(props) {
  const element = document.createElement("div");
  element.id = id.costly;

  Object.entries(props).forEach(([k, v]) => {
    const tag = document.createElement(k === "cost" ? "strong" : "span");
    if (k === "cost") {
      tag.style.background = "red";
      tag.style.color = "whitesmoke";
      tag.style.padding = "0.3em";
    }
    tag.appendChild(document.createTextNode(k === "cost" ? `$${v}` : v));
    element.appendChild(tag);
  });

  return element;
}

function getDurations(timeStr) {
  const nTime = (timeStr || "").split("").filter((n) => /\d+/.test(n));

  const [d1, d2] = {
    [true]: [0, 0],
    [nTime.length === 6]: arrayChunks(nTime, 3).map((d) => getTime(d)),
    [nTime.length === 7]: arrayChunks(nTime.reverse(), 3)
      .map((d) => getTime(d))
      .reverse(),
    [nTime.length === 8]: arrayChunks(nTime, 4).map((d) => getTime(d)),
  }.true;

  return Math.floor((d2 - d1) / (1000 * 60 * 60));
}

function makeViewCostly() {
  const targetDialog = Promise.resolve()
    .then(
      () =>
        document.querySelector("[data-open-edit-note]").childNodes[0]
          .childNodes[2].childNodes[0]
    )
    .catch(nuLL);

  targetDialog &&
    targetDialog
      .then((node) => {
        const timeStr =
          node.childNodes[1].childNodes[0].childNodes[1].childNodes[2]
            .firstChild.textContent;
        const durations = getDurations(timeStr);
        const costly = Message({
          title: "Estimated Meeting Cost is ",
          cost: calculateCost({
            hourlyRate: 50,
            durations: durations | 0,
          }),
        });

        node.childNodes[1].appendChild(costly);
      })
      .catch(noOp);
}

setInterval(() => !document.getElementById(id.costly) && makeViewCostly(), 500);
