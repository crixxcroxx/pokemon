const MAP_WIDTH = 18

export const utils = {
  $: name => {
    return document.querySelector(name)
  },
  getIndex: (x, y) => {
    return (y * MAP_WIDTH) + x
  },
  delay: time => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time)
    })
  },
  removeChildren: parent => {
    while(parent.firstChild) {
      parent.removeChild(parent.firstChild)
    }
  },
  disableButtons: function(element, t) {
    document.querySelectorAll(element).forEach(elem => {
      elem.disabled = t;
    });
  },
  animateElement: (element, keyframes, duration) => {
    let anim = element.animate(
      keyframes,
      {
        duration: duration,
        easing: 'linear',
        fill: 'forwards'
      }
    )

    anim.commitStyles()
    return anim.finished
  }
}
