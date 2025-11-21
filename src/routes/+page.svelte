<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Accordion from '$lib/components/Accordion.svelte';
	import Rules from './Rules.svelte';
	import Prizes from './Prizes.svelte';
	import Footer from './Footer.svelte';

	import model from '$lib/assets/rocket.3mf?url';

	let { data } = $props();

	import * as THREE from 'three';
	import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';
	import { OrbitControls } from 'three/examples/jsm/Addons.js';
	import { onMount } from 'svelte';

	// Necessary for camera/plane rotation
	let degree = Math.PI / 180;

	// Create scene
	const scene = new THREE.Scene();

	onMount(() => {
		if (!model) {
			return;
		}

		let canvas = document.querySelector(`#canvas`);

		if (!canvas) {
			return;
		}

		const renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true
		});

		renderer.setClearColor(0xffffff, 0);
		renderer.setPixelRatio(window.devicePixelRatio);

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		// There's no reason to set the aspect here because we're going
		// to set it every frame anyway so we'll set it to 2 since 2
		// is the the aspect for the canvas default size (300w/150h = 2)
		const camera = new THREE.PerspectiveCamera(40, 2, 1, 1000);
		camera.rotation.x = -45 * degree;

		// Add controls, targetting the same DOM element
		let controls = new OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 0);
		controls.rotateSpeed = 0.3;
		controls.enablePan = false;
		controls.dampingFactor = 0.1;
		controls.enableDamping = true;
		controls.autoRotate = true;
		controls.autoRotateSpeed = 2;
		controls.update();

		// Lighting
		const hemisphere = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.1);
		scene.add(hemisphere);

		const directional = new THREE.DirectionalLight(0xffffff, 1.1);
		directional.castShadow = true;
		directional.shadow.mapSize.width = 2048;
		directional.shadow.mapSize.height = 2048;
		scene.add(directional);

		const directional2 = new THREE.DirectionalLight(0xffffff, 1.1);
		directional2.castShadow = true;
		directional2.shadow.mapSize.width = 2048;
		directional2.shadow.mapSize.height = 2048;
		scene.add(directional2);

		function resizeCanvasToDisplaySize() {
			const canvas = renderer.domElement;
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;
			if (canvas.width !== width || canvas.height !== height) {
				// you must pass false here or three.js sadly fights the browser
				renderer.setSize(width, height, false);
				renderer.setPixelRatio(window.devicePixelRatio);
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
			}
		}

		function parseObject(object: THREE.Group<THREE.Object3DEventMap>) {
			object = object as THREE.Group<THREE.Object3DEventMap> & { children: THREE.Mesh[] };

			object.rotation.x = THREE.MathUtils.degToRad(-90);
			object.rotation.z = THREE.MathUtils.degToRad(-25);

			const aabb = new THREE.Box3().setFromObject(object);
			const center = aabb.getCenter(new THREE.Vector3());

			object.position.x += object.position.x - center.x;
			object.position.y += object.position.y - center.y;
			object.position.z += object.position.z - center.z;

			controls.reset();

			var box = new THREE.Box3().setFromObject(object);
			const size = new THREE.Vector3();
			box.getSize(size);
			const largestDimension = Math.max(size.x, size.y, size.z);

			camera.position.z = largestDimension * 1.75;
			camera.position.y = 0;

			directional.position.set(largestDimension * 2, largestDimension * 2, largestDimension * 2);
			directional2.position.set(-largestDimension * 2, largestDimension * 2, -largestDimension * 2);

			camera.near = largestDimension * 0.001;
			camera.far = largestDimension * 10;
			camera.updateProjectionMatrix();

			const edgeLines: { lines: THREE.LineSegments; mesh: THREE.Mesh }[] = [];

			object.traverse(function (child) {
				child.castShadow = true;
				child.receiveShadow = true;

				const mesh = child as THREE.Mesh;

				const material = mesh.material;

				if (Array.isArray(material)) {
					material.forEach((mat) => {
						mat.transparent = true;
						mat.side = THREE.DoubleSide;
						mat.opacity = 0.9;
						mat.needsUpdate = true;
					});
				} else if (material instanceof THREE.Material) {
					material.transparent = true;
					material.side = THREE.DoubleSide;
					material.opacity = 0.9;
					material.needsUpdate = true;
				}

				const edges = new THREE.EdgesGeometry(mesh.geometry);
				const lines = new THREE.LineSegments(
					edges,
					new THREE.LineBasicMaterial({
						color: 0xf3dcc6,
						linewidth: 1,
						polygonOffset: true,
						polygonOffsetFactor: -1,
						polygonOffsetUnits: -1
					})
				);

				lines.position.copy(mesh.position);
				lines.rotation.copy(mesh.rotation);

				edgeLines.push({ lines, mesh });
			});

			// Have to do it this way to avoid infinite recursion
			edgeLines.forEach(({ lines, mesh }) => {
				mesh.add(lines);
			});

			scene.add(object);
		}

		var loader = new ThreeMFLoader();

		loader.load(
			model,
			parseObject,
			(xhr) => {
				// TODO: loading slider
				console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
			},
			(error) => {
				console.log(error);
			}
		);

		const animate = function () {
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
			resizeCanvasToDisplaySize();
		};
		animate();
	});
</script>

<a href="https://hackclub.com/">
	<img
		class="transition-transform hover:rotate-6"
		style="
					transform-origin: top left;
					position: absolute;
					top: -5px;
					left: 10px;
					border: 0;
					width: 128px;
					z-index: 999;
				"
		src="https://assets.hackclub.com/flag-orpheus-top.svg"
		alt="Hack Club"
	/>
</a>

<div class="flex w-full flex-col items-center justify-center px-10 lg:flex-row">
	<div class="mt-40">
		<h1 class="font-hero text-4xl sm:text-5xl md:text-6xl">Framework</h1>
		<p class="my-3 text-xl font-medium">
			Design a Framework expansion card, get it manufactured!
		</p>
		{#if data.loggedIn}
			<Button text="Go to dashboard" href="/dashboard" />
		{:else}
			<Button text="Login with Slack" href="/auth/slack" />
		{/if}
	</div>
	<div class="mt-12 flex h-80 w-80 flex-col md:w-100">
		<canvas class="h-full w-full" id={`canvas`}></canvas>
		<p class="mt-2 w-full text-center text-sm">interact with me!</p>
	</div>
</div>

<div class="mt-24 flex flex-col items-center justify-center px-10">
	<h1 class="mb-3 text-center text-3xl font-bold sm:text-4xl">What is this?</h1>
	<div class="w-full max-w-2xl">
		<p class="mt-3 max-w-2xl">
			<strong>Ever wanted to own a cool rocket?</strong> Now, you can do so! All you need to do is spend
			10 hours designing a rocket in CAD and we'll ship one right to your house, completely for free.
		</p>
	</div>
</div>

<Prizes />

<Rules />

<div class="mt-20 flex flex-col items-center justify-center px-10">
	<h1 class="mb-3 text-center text-2xl font-bold sm:text-4xl">Frequently asked questions</h1>
	<div class="w-full max-w-2xl">
		<Accordion text="Is this free?">
			<p>
				Yes! This program is entirely funded by <a href="https://hackclub.com" class="underline">
					Hack Club
				</a>.
			</p>
		</Accordion>
		<Accordion text="What can I make?">
			<p>Any sort of reasonable rocket design is fine, get creative!</p>
		</Accordion>
		<Accordion text="What are the requirements?">
			<p>
				You must spend at least 10 hours on your design, which must be made in Onshape using
				Onshape-Wakatime.
			</p>
		</Accordion>
		<Accordion text="How will you deliver it?">
			<p>
				You'll wake up to a big rocket towering over your house at 6am in the morning on a random
				Saturday.
			</p>
		</Accordion>
		<Accordion text="Where did you get these rockets from?">
			<p>We blackmailed SpaceX and NASA.</p>
		</Accordion>
	</div>
</div>

<Footer />
