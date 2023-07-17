const app0 = (f) => f();

const defaultOptions = {
  hourlyRate: 560000,
  currency: "IDR.id-ID",
};

const id = {
  hourlyRate: "optionHourlyRate",
  currency: "optionCurrency",
};

const setValue = (node, value) =>
  ({
    [true]: () => {
      node.value = value;
    },
    [node.type === "checkbox"]: () => {
      node.checked = value;
    },
  }.true());

const setOptionsForCurrency = () => {
  const currency = document.getElementById(id.currency);
  const currencies = {
    // TODO
    IDR: "id-ID",
    USD: "en-US",
  };
  Object.entries(currencies).forEach(([key, value]) => {
    const option = document.createElement("option");
    option.value = `${key}.${value}`;
    option.append(document.createTextNode(`${key} - ${value}`));
    currency.append(option);
  });
};

const restoreOptions = () => {
  const idElements = Object.entries(id).reduce(
    (acc, [key, id]) => ({
      ...acc,
      [key]: document.getElementById(id),
    }),
    {}
  );

  const setValues = (items) =>
    Object.entries(idElements).forEach(([key, node]) =>
      setValue(node, items[key] || defaultOptions[key])
    );

  chrome.storage.sync.get(Object.keys(idElements)).then(setValues);
};

const saveOptions = (options) => chrome.storage.sync.set(options);

const setEventChangeForInput = () => {
  Object.entries(id).forEach(([key, id]) => {
    const listener = (e) => {
      const value = e.currentTarget.value;
      saveOptions({ [key]: value });
    };

    document.getElementById(id).addEventListener("change", listener);
  });
};

document.addEventListener("DOMContentLoaded", () =>
  [setOptionsForCurrency, restoreOptions, setEventChangeForInput].forEach(app0)
);
