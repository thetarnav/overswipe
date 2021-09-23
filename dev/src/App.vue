<script setup lang="ts">
import detectSwipe from '../../src/index'
import { onMounted, ref } from 'vue'

const container = ref<HTMLElement>(),
	el = ref<HTMLElement>()

onMounted(() => {
	if (el.value && container.value) {
		const observer = detectSwipe(el.value, container.value)
		observer.on('progress', a => {
			console.table(a)
		})
	}
})
</script>

<template>
	<main ref="container">
		<section ref="el">Hello</section>
	</main>
</template>

<style lang="scss">
html,
body {
	margin: 0;
	width: 100vw;
	min-height: 100vh;
	overflow-x: hidden;
	overflow-y: auto;
	overscroll-behavior: none;
}

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}

main {
	margin: auto;
	width: 80vw;
	height: 80vh;
	overflow-x: hidden;
	overflow-y: scroll;
	overscroll-behavior: none;
}

section {
	width: 100%;
	height: 150%;
	background: #333;
}
</style>
