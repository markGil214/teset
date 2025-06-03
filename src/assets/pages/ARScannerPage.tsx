import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { organs } from "../components/organData";

// Declare global variables for the libraries
declare global {
  interface Window {
    THREE: any;
    THREEAR: any;
  }
}

const ARScannerPage: React.FC = () => {
  const { organId } = useParams<{ organId: string }>();
  const navigate = useNavigate();
  const organ = organs.find((o) => o.id === organId);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!organ) {
    return <div>Organ not found</div>;
  }

  useEffect(() => {
    if (!containerRef.current) return;

    // EXACT COPY-CAT of basic-cutout.html script section
    var renderer = new window.THREE.WebGLRenderer({
      // antialias: true,
      alpha: true,
    });
    renderer.setClearColor(new window.THREE.Color("lightgrey"), 0);
    // renderer.setPixelRatio(2);
    renderer.setSize(window.innerWidth, window.innerHeight);    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";
    document.body.appendChild(renderer.domElement);    // init scene and camera - EXACT SAME AS BASIC.HTML
    var scene = new window.THREE.Scene();
    var camera = new window.THREE.Camera();
    scene.add(camera);

    var markerGroup = new window.THREE.Group();
    scene.add(markerGroup);

    var source = new window.THREEAR.Source({ renderer, camera });

    window.THREEAR.initialize({ source: source }).then((controller: any) => {
      // add a torus knot - EXACT SAME AS BASIC.HTML		
      var geometry = new window.THREE.TorusKnotGeometry(0.3,0.1,64,16);
      var material = new window.THREE.MeshNormalMaterial(); 
      var torus = new window.THREE.Mesh( geometry, material );
      torus.position.y = 0.5;
      markerGroup.add(torus);

      var geometry = new window.THREE.CubeGeometry(1,1,1);
      var material = new window.THREE.MeshNormalMaterial({
        transparent : true,
        opacity: 0.5,
        side: window.THREE.DoubleSide
      }); 
      var cube = new window.THREE.Mesh( geometry, material );
      cube.position.y = geometry.parameters.height / 2;
      markerGroup.add(cube);      var patternMarker = new window.THREEAR.PatternMarker({
        patternUrl: "/data/patt.hiro",
        markerObject: markerGroup,
      });

      controller.trackMarker(patternMarker);

      // Use EXACT SAME animation loop as basic.html - THIS IS KEY!
      var lastTimeMsec = 0;
      requestAnimationFrame(function animate(nowMsec: number) {
        // keep looping
        requestAnimationFrame( animate );
        // measure time
        lastTimeMsec = lastTimeMsec || nowMsec-1000/60;
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
        lastTimeMsec = nowMsec;
        // call each update function
        controller.update( source.domElement );
        // cube.rotation.x += deltaMsec/10000 * Math.PI
        torus.rotation.y += deltaMsec/1000 * Math.PI;
        torus.rotation.z += deltaMsec/1000 * Math.PI;
        renderer.render( scene, camera );
      });
    });// Cleanup
    return () => {
      // Remove the renderer element from document.body
      const rendererElements = document.querySelectorAll('canvas');
      rendererElements.forEach(canvas => {
        if (canvas.parentElement === document.body) {
          document.body.removeChild(canvas);
        }
      });
    };
  }, [organ]);
  return (
    <div style={{ margin: "0px", overflow: "hidden", fontFamily: "Monospace" }}>
      {/* Text overlay - EXACT same style as cutout example */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          right: "10px",
          zIndex: 100,
        }}
      >
        <div>
          AR Scanner for <strong>{organ.name}</strong> - Point your camera at
          the Hiro marker
        </div>
        <div
          id="button"
          style={{
            backgroundColor: "rgba(201, 76, 76, 0.3)",
            padding: "8px",
            marginTop: "10px",
            cursor: "pointer",
          }}
          onClick={() => navigate(-1)}
        >
          ← Back to Menu [{organ.name} 3D Model]
        </div>
      </div>

      {/* AR container - attached to body like cutout example */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
        }}
      />
    </div>
  );
};

export default ARScannerPage;
