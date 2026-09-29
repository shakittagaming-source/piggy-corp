import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ThreeCharacter.css';

export default function ThreeCharacter() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-2.25, 2.25, 2.25, -2.25, 0.1, 100);
    camera.position.set(0, 1.1, 7);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const stage = new THREE.Group();
    scene.add(stage);
    const pig = new THREE.Group();
    stage.add(pig);

    const green = new THREE.MeshStandardMaterial({ color: 0x67c95a, roughness: .55, metalness: .04 });
    const greenLight = new THREE.MeshStandardMaterial({ color: 0xb8ed72, roughness: .45 });
    const purple = new THREE.MeshStandardMaterial({ color: 0x6736ad, roughness: .5 });
    const purpleDark = new THREE.MeshStandardMaterial({ color: 0x492b83, roughness: .58 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xf1c44c, roughness: .32, metalness: .45 });
    const coral = new THREE.MeshStandardMaterial({ color: 0xf08b72, roughness: .45 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x563752, roughness: .7 });
    const white = new THREE.MeshStandardMaterial({ color: 0xfff8dc, roughness: .35 });
    const cyan = new THREE.MeshStandardMaterial({ color: 0x57e1df, emissive: 0x164f70, emissiveIntensity: .55, roughness: .2, metalness: .1 });
    const iris = new THREE.MeshStandardMaterial({ color: 0x2f8e73, roughness: .3, metalness: .05 });

    const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, position: [number, number, number], scale: [number, number, number] = [1, 1, 1]) => {
      const item = new THREE.Mesh(geometry, material);
      item.position.set(...position);
      item.scale.set(...scale);
      pig.add(item);
      return item;
    };

    mesh(new THREE.SphereGeometry(1, 32, 24), green, [0, .72, 0], [1.05, .9, .82]);
    mesh(new THREE.CylinderGeometry(.62, .86, 1.05, 32), purple, [0, -.18, -.12], [1, 1, .8]);
    mesh(new THREE.SphereGeometry(.24, 20, 14), purpleDark, [-.42, -.76, .03], [1.2, .55, 1]);
    mesh(new THREE.SphereGeometry(.24, 20, 14), purpleDark, [.42, -.76, .03], [1.2, .55, 1]);
    const armLeft = mesh(new THREE.CylinderGeometry(.11, .15, .8, 16), purpleDark, [-.86, -.08, .02]);
    armLeft.rotation.z = -.42;
    const armRight = mesh(new THREE.CylinderGeometry(.11, .15, .8, 16), purpleDark, [.86, -.08, .02]);
    armRight.rotation.z = .42;
    mesh(new THREE.SphereGeometry(.48, 32, 20), coral, [0, .73, 1.02], [1, .72, .6]);
    mesh(new THREE.SphereGeometry(.085, 16, 12), dark, [-.18, .75, 1.39], [1, 1, .45]);
    mesh(new THREE.SphereGeometry(.085, 16, 12), dark, [.18, .75, 1.39], [1, 1, .45]);

    for (const x of [-.34, .34]) {
      mesh(new THREE.SphereGeometry(.2, 28, 20), white, [x, 1.27, 1.08], [1, 1, .42]);
      mesh(new THREE.SphereGeometry(.105, 24, 16), iris, [x, 1.27, 1.245], [1, 1, .34]);
      mesh(new THREE.SphereGeometry(.052, 18, 12), dark, [x + (x < 0 ? -.018 : .018), 1.27, 1.3], [1, 1, .35]);
      mesh(new THREE.SphereGeometry(.018, 12, 8), white, [x - .025, 1.32, 1.33], [1, 1, .3]);
      const brow = mesh(new THREE.BoxGeometry(.34, .075, .08), dark, [x, 1.49, .98]);
      brow.rotation.z = x < 0 ? -.18 : .18;
    }
    mesh(new THREE.ConeGeometry(.25, .48, 3), greenLight, [-.6, 1.86, .05], [1, 1, 1]);
    mesh(new THREE.ConeGeometry(.25, .48, 3), greenLight, [.6, 1.86, .05], [1, 1, 1]);
    const smile = mesh(new THREE.TorusGeometry(.16, .035, 8, 20, Math.PI), dark, [0, .46, 1.26]);
    smile.rotation.z = Math.PI;

    mesh(new THREE.ConeGeometry(.9, 1.15, 32), purple, [0, 2.05, 0], [1, 1, 1]);
    mesh(new THREE.CylinderGeometry(1.08, 1.08, .14, 32), purpleDark, [0, 1.82, 0], [1, 1, 1]);
    mesh(new THREE.CylinderGeometry(.82, .82, .13, 32), gold, [0, 1.93, 0], [1, 1, 1]);
    mesh(new THREE.CylinderGeometry(.08, .08, 2.45, 12), purpleDark, [1.05, .82, -.05], [1, 1, 1]);
    mesh(new THREE.SphereGeometry(.16, 20, 14), greenLight, [.86, .02, .34], [1.2, .8, 1]);
    mesh(new THREE.SphereGeometry(.25, 24, 18), cyan, [1.13, 1.9, -.05], [1, 1, 1]);
    mesh(new THREE.CylinderGeometry(.13, .13, 1.5, 20), gold, [0, -.05, -.08], [1, 1, 1]);
    mesh(new THREE.CylinderGeometry(.2, .2, .12, 20), gold, [0, .18, -.08], [1, 1, 1]);
    mesh(new THREE.TorusGeometry(.18, .05, 8, 18), gold, [0, -.18, .58]);

    const cape = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.8, 32, 1, true), purpleDark);
    cape.position.set(0, .1, -.48);
    cape.rotation.x = Math.PI;
    pig.add(cape);

    const orbLight = new THREE.PointLight(0x6df8f0, 1.5, 3);
    orbLight.position.set(1.13, 1.9, 1);
    pig.add(orbLight);
    scene.add(new THREE.HemisphereLight(0xfff4d6, 0x573b8d, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(-3, 5, 5);
    scene.add(keyLight);

    const resize = () => {
      const width = mount.clientWidth || 180;
      const height = mount.clientHeight || 180;
      renderer.setSize(width, height, false);
      const ratio = width / height;
      camera.left = -2.25 * ratio;
      camera.right = 2.25 * ratio;
      camera.top = 2.25;
      camera.bottom = -2.25;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    let frame = 0;
    const animate = (time: number) => {
      stage.position.y = Math.sin(time * .0018) * .08;
      pig.rotation.y = Math.sin(time * .0008) * .12;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      scene.traverse((item) => {
        if (item instanceof THREE.Mesh) {
          item.geometry.dispose();
          if (Array.isArray(item.material)) item.material.forEach((material) => material.dispose());
          else item.material.dispose();
        }
      });
    };
  }, []);

  return <div className="three-character-stage" ref={mountRef} role="img" aria-label="Astra, the 3D wizard pig finance mentor" />;
}
