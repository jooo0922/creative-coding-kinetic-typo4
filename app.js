'use strict';

// 임시 캔버스에 텍스트가 어떻게 렌더되는지 보려고 테스트삼아 작성한 것.
// 나중에 실제 캔버스에 렌더할 때는 지워줄거임.
import {
  Text
} from './text.js';

import {
  Visual
} from './visual.js';

class App {
  constructor() {
    // 여기에는 particle들을 실제로 렌더해서 화면에 보여줄거임
    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // 현재 모니터가 레티나를 지원할 정도가 되면 2, 아니면 1을 리턴해줌
    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;

    // 윈도우가 로드되면 Web Font Loader Library에서 원하는 폰트를 로드해옴
    WebFont.load({
      google: {
        families: ['Hind:700']
      },
      fontactive: () => {
        // 임시 캔버스에 텍스트가 어떻게 렌더되는지 보려고 테스트삼아 작성한 것.
        // 실제 캔버스에 렌더할 때는 지워줄거임.
        /*
        this.text = new Text();
        this.text.setText(
          'A',
          2,
          document.body.clientWidth,
          document.body.clientHeight,
        );
        */

        // Web Font를 로드 받아서 렌더하면 Visual 인스턴스를 생성한 뒤
        // 브라우저에 리사이징 이벤트를 걸고, this.resize 메소드를 호출하고,
        // this.animate()를 requestAnimationFrame으로 호출해 줌.
        this.visual = new Visual();

        window.addEventListener('resize', this.resize.bind(this), false);
        this.resize();

        requestAnimationFrame(this.animate.bind(this));
      }
    });
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    /**
     * CanvasRenderingContext2D.globalCompositeOperation = 'type'
     * 
     * 캔버스에 그려진 도형끼리 합성(compostion)효과를 내고 싶을 때 사용.
     * 26가지의 합성 방법(type)을 지정해줄 수 있음.
     * 
     * creative-coding-gradation에서 사용했던 방법임. 복습할 때 정리한 내용 참고할 것.
     */
    this.ctx.globalCompositeOperation = 'lighter';

    // 리사이징 이벤트가 발생할 때마다 변경된 브라우저 사이즈값을 가져와서
    // this.visual.show()메소드를 호출하여 변경된 브라우저 사이즈에 맞게 위치를 재조정하여
    // 임시 캔버스에 커다란 텍스트를 렌더해 줌.
    this.visual.show(this.stageWidth, this.stageHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this)); // 내부에서 호출해서 반복할 수 있도록 해줌

    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight); // 매 프레임마다 실제 캔버스를 한번씩 지워주고 다시 그려줌

    // 매 프레임마다 실제 캔버스에 무작위로 particle 10개를 렌더해주겠지.
    // 그러다가 생성된지 100프레임이 지난 애들이거나, 마우스 움직임에 침범당한 애들은
    // 반지름이 쪼그라들다가 화면에서 사라지게 될거임.
    this.visual.animate(this.ctx);
  }
}

window.onload = () => {
  new App();
}