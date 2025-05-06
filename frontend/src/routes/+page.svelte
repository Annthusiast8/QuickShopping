<script lang="ts">
    import Sidebar from '$lib/sidebar.svelte';
    import Header from '$lib/header.svelte';
    import Login from "./login/+page.svelte";
    import axios from "axios";
    import { onMount } from "svelte";

    let data : any = ""

    onMount(()=>{
        axios.get('http://127.0.0.1:8000/api/items/')
        .then((res: any)=>{
            data = res.data
            console.log(data[0].name)
        }).catch((err:any)=>{

        })
    })
</script>

