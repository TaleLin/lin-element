import { reactive, onMounted, onUnmounted } from 'vue'

export default function useRoute() {
  let route = reactive({})
  route.value = document.location.hash

  const reactiveRoute = () => { route.value = document.location.hash }

  onMounted(() => {
    window.addEventListener('hashchange', reactiveRoute)
  })

  onUnmounted(() => {
    window.removeEventListener('hashchange', reactiveRoute)
  })

  return route
}