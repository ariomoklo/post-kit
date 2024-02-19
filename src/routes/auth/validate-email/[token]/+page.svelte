<script lang="ts">
	import { base } from "$app/paths";
	import type { PageData } from "./$types";

    export let data: PageData
</script>

<main style="width: 100%; display: grid; place-items: center; padding: 1rem;">
    <section style="width: 275px;">
        <h1>Thankyou {data.userdata?.username ?? ''}</h1>
        <p style="margin: 0px;">Your email has been verified. Please log in to access your account.</p>
        <a href={`${base}/auth/signin`}>Go to login page</a>
    </section>
</main>