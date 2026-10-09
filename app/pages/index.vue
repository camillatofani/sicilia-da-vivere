<script setup lang="ts">
  const title = 'Sicilia, da vivere';
</script>

<template>
  <main>
    <h1>{{ title }}</h1>
    <p>Scopri le esperienze della nostra isola.</p>

    <ExperienceCard />
    <ExperienceCard
        title="Street food a Palermo"
        description="Una passeggiata tra mercati e sapori siciliani."
        :price="45"
    />
    <ExperienceCard
        title="Escursione sull’Etna"
        description="Un percorso tra crateri e paesaggi vulcanici."
        :price="70"
    />
  </main>
</template>