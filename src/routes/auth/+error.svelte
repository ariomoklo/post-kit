<script lang="ts">
	import { base } from "$app/paths";
	import { page } from "$app/stores";
</script>

<main style="width: 100%; display: grid; place-items: center; padding:1rem;">
    <section style="width: 275px;">
        <h1>Error: { $page.status }</h1>
        <p style="margin: 0px;">{ $page.error?.message ?? 'Something bad happens.' }</p>
        <a href={`${base}/`}>Go to Root directory</a>
    </section>
</main>