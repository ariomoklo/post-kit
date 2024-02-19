<script>
    import { Section } from "svelte-email";
</script>

<Section class="row row-1" style={{ width: '100%' }}>
    <td>
        <Section class="row-content stack" style={{ backgroundColor: "#ffffff", color: "#000000", width: '680px', margin: '0 auto' }}>
            <slot></slot>
        </Section>
    </td>
</Section>