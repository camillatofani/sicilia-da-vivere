<script setup lang="ts">
    const title = 'Sicilia, da vivere';
    type Post = {
        id: number
        title: string
        body: string
    }

    const { data: posts, status, error } = await useFetch<Post[]>(
        'https://jsonplaceholder.typicode.com/posts?_limit=3'
    )
    console.log(posts.value)
</script>

<template>
  <main>
    <h1>{{ title }}</h1>
    <p>Scopri le esperienze della nostra isola.</p>

    <section>
        <h2>Le esperienze</h2>

        <p v-if="status === 'pending'">Caricamento...</p>
        <p v-else-if="error">Non siamo riusciti a caricare i contenuti.</p>

        <div v-else>
            <ExperienceCard
                v-for="post in posts"
                    :key="post.id"
                    :title="post.title"
                    :description="post.body"
                    :price="post.id * 10"
            />
        </div>
    </section>

  </main>
</template>