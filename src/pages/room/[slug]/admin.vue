<script lang="ts" setup>
const route = useRoute();
const { $io } = useNuxtApp()

const questions = ref([] as any);
const socket = ref({} as any)

const code = route.params.slug as string

onMounted(() => {
    socket.value = $io('http://localhost:3000')

    socket.value.emit("join-room", {
        roomId: route.params.slug,
    });

    socket.value.on("all-questions", (messageValue: any) => {
        try {
            console.log(messageValue);
            questions.value = messageValue;
        } catch (e) {
            console.error(e);
        }
    });
    socket.value.on("new-question", (messageValue: string) => {
        try {
            console.log(messageValue);
            questions.value.push(messageValue);
        } catch (e) {
            console.error(e);
        }
    });
});

onBeforeUnmount(() => {
    socket.value?.disconnect();
});
</script>
<template>
    <div class="bg-gray-50 min-h-screen">
        <HeaderRoom :code="code" :isAdmin="true" />
        <main class="max-w-4xl w-full flex flex-col px-8 mx-auto">
            <div class="flex gap-4 items-center my-8">
                <h1 class="text-2xl font-bold font-poppins">Sala</h1>
                <span
                    class="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-purple-600 text-white"
                    v-if="questions.length">
                    {{ questions.length }} perguntas
                </span>
            </div>
            <ul>
                <QuestionCard v-for="q in questions" :key="q" :question="q">
                    <div class="flex justify-between items-center gap-2">
                        <span class="text-gray-600">
                            {{ q.like_count }}
                        </span>
                        <button class="text-purple-600">
                            <LucideThumbsUp />
                        </button>
                    </div>
                </QuestionCard>
            </ul>
        </main>
    </div>
</template>
