import { ref } from 'vue';

const captchaVisible = ref(false);
const setVisible = (visible: boolean) => {
  captchaVisible.value = visible;
};

export { captchaVisible, setVisible };
