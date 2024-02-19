<script lang="ts">
	import SuperDebug, { superForm } from "sveltekit-superforms";
	import type { ActionData, PageData } from "./$types";

    export let form: ActionData
    export let data: PageData

    const { form: sform, errors, enhance } = superForm(data.form)
</script>

<main style="width: 100%; display: grid; place-items: center; padding: 1rem;">
    <section style="width: 100%; display: flex; align-items: center; justify-items: center; flex-direction: column;">
        <div style="width: 100%; display: flex; gap: 1rem;">
            <div style="flex-grow: 1;">
                <SuperDebug data={$sform} label="form" collapsible={true}/>
            </div>
            <div style="flex-grow: 1;">
                <SuperDebug data={{ formError: $errors, actionError: form?.error }} label="error" collapsible={true}/>
            </div>
        </div>
        <br>
        <form use:enhance method="post" style="width: 100%; max-width: 500px;">
            <input type="text" placeholder="username / email" name="identity" bind:value={$sform.identity}>
            {#if $errors.identity}<span class="invalid">{$errors.identity}</span>{/if}

            <input type="password" placeholder="password" name="password" bind:value={$sform.password}>
            {#if $errors.password}<span class="invalid">{$errors.password}</span>{/if}
            
            <br>
        
            <button type="submit">signin</button>
        </form>
    </section>
</main>