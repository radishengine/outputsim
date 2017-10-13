
self.outputsim = {};

outputsim.init = function init(container) {
  if (container.classList.contains('zx-spectrum')) {
    return Promise.resolve(container);
  }
  else {
    return Promise.reject('invalid or unspecified target');
  }
};
