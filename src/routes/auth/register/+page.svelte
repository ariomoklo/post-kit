<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import SuperDebug from "sveltekit-superforms";
	import type { ActionData, PageData } from "./$types";

    export let form: ActionData;
    export let data: PageData;
    const { form: sform, enhance, errors } = superForm(data.form);
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
            <input type="text" placeholder="username" name="username" bind:value={$sform.username}>
            {#if $errors.username}<span class="invalid">{$errors.username}</span>{/if}

            <input type="email" placeholder="email" name="email" bind:value={$sform.email}>
            {#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}

            <input type="text" placeholder="fullname" name="fullname" bind:value={$sform.fullname}>
            {#if $errors.fullname}<span class="invalid">{$errors.fullname}</span>{/if}

            <input type="password" placeholder="password" name="password" bind:value={$sform.password}>
            {#if $errors.password}<span class="invalid">{$errors.password}</span>{/if}
            
            <br>
        
            <button type="submit">register</button>
        </form>
    </section>
</main>
