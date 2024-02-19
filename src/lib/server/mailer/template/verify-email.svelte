<script>
    import Subtitle from "./components/subtitle.svelte";
    import Column from "./components/column.svelte";
    import Spacer from "./components/spacer.svelte";
    import Title from "./components/title.svelte";
    import Main from "./components/main.svelte";
    import Row from "./components/row.svelte";

    import { Button } from "svelte-email"

    /** @type string*/
    export let username

    /** @type string*/
    export let fullname
    
    /** @type string*/
    export let link

    let title = `Hi ${username}, verify your email address!`
</script>

<Main {title} description="Thanks for joining us {fullname}, please verify your email address by pressing verify button bellow. Thankyou.">

    <Row>
        <Column>
            <Spacer />
            <Title>{title}</Title>
        </Column>
    </Row>

    <Row>
        <Column>
            <Subtitle>Thanks for joining us <b style="color: lightblue;">{fullname}</b>, please verify your email address by pressing verify button bellow. Thankyou.</Subtitle>
            <Spacer />
            <table class="button_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                <tr>
                    <td class="pad" style="text-align: center;">
                        <Button href={link} target="_blank" style={{
                            textDecoration: "none",
                            display: "inline-block",
                            color: "#ffffff",
                            backgroundColor:"#101",
                            borderRadius: "4px",
                            width: "auto",
                            borderTop: "1px solid #101",
                            fontWeight: "undefined",
                            borderRight: "1px solid #101",
                            borderLeft: "1px solid #101",
                            borderBottom: "1px solid #101",
                            paddingTop: "5px",
                            paddingBottom: "5px",
                            paddingLeft: "1rem",
                            paddingRight: "1rem",
                            fontFamily: "Arial, Helvetica Neue, Helvetica, sans-serif",
                            fontSize: "16px",
                            textAlign: "center",
                            wordBreak: "keep-all",
                        }}>
                            Verify Email Address
                        </Button>
                    </td>
                </tr>
            </table>
            <Spacer />
        </Column>
    </Row>
</Main>