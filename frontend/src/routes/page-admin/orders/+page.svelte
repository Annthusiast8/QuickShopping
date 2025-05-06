<script lang="ts">
    import axios from "axios";
    import { onMount } from "svelte";
    import Header from '$lib/header.svelte';
    let data : any = ""

    onMount(()=>{
        axios.get('http://127.0.0.1:8000/api/items/')
        .then((res: any)=>{
            data = res.data
            console.log(data[0].name)
        }).catch((err:any)=>{
            console.error(err);
        })
    })

    let orders = [
        {
            storeName: 'Prada Official Store',
            status: 'To Ship',
            productImg: '/shades.png',
            productTitle: 'Prada Veloce X1 Sunglasses',
            variation: 'Black',
            qty: 1,
            price: 1250,
            orderTotal: 1250
        },
        {
            storeName: 'Gucci Flagship',
            status: 'Pending',
            productImg: '/shades.png',
            productTitle: 'Gucci Marmont Bag',
            variation: 'Red',
            qty: 2,
            price: 980,
            orderTotal: 1960
        },
        {
            storeName: 'Nike Store',
            status: 'Completed',
            productImg: '/shades.png',
            productTitle: 'Nike Air Max',
            variation: 'White',
            qty: 1,
            price: 150,
            orderTotal: 150
        },
        {
            storeName: 'Adidas Shop',
            status: 'To Receive',
            productImg: '/static/shades.png',
            productTitle: 'Adidas Ultraboost',
            variation: 'Black',
            qty: 1,
            price: 180,
            orderTotal: 180
        }
    ];

    const tabs = [
        { label: 'All', value: 'All' },
        { label: 'Pending', value: 'Pending' },
        { label: 'To Ship', value: 'To Ship' },
        { label: 'To Receive', value: 'To Receive' },
        { label: 'Completed', value: 'Completed' }
    ];

    let selectedTab = 'All';
    let searchQuery = '';

    $: filteredOrders = selectedTab === 'All' 
        ? orders.filter(order => 
            order.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.productTitle.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : orders.filter(order => 
            order.status === selectedTab &&
            (order.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.productTitle.toLowerCase().includes(searchQuery.toLowerCase()))
        );
</script>

<Header />
<div class="flex mt-[2px] bg-[#f6f1e4] min-h-[calc(100vh-60px)]">
    <div class="flex-1 p-8 sidebar-margin bg-[#f6f1e4] min-h-screen">
        <!-- Tabs -->
        <div class="flex tab-gap space-x-5 border-b-2 border-gray-200 mb-8 tab-text font-medium">
            {#each tabs as tab}
                <button
                    class="py-2 cursor-pointer transition-colors duration-200 {selectedTab === tab.value ? 'text-[#2b4b66] border-b-2 border-[#2b4b66] font-semibold' : 'text-gray-500 hover:text-gray-700'}"
                    on:click={() => selectedTab = tab.value}
                >
                    {tab.label}
                </button>
            {/each}
        </div>

        <!-- Search Bar -->
        <div class="relative max-w-[600px] my-5 mb-8">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="You can search by Seller or Product name"
                class="w-full pl-4 pr-10 py-3 rounded-[18px] border-[1.5px] border-gray-200 bg-[#f6f1e4] focus:outline-none focus:border-[#2b4b66]"
            />
            <img src="/Search.png" alt="Search" class="absolute right-3 top-1/2 transform -translate-y-1/2 w-[2.25rem] h-5" />
        </div>

        <!-- Orders List -->
        <div class="flex flex-col gap-8">
            {#each filteredOrders as order}
                <div class="bg-white rounded-lg shadow-sm card-padding py-6 px-8">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-lg font-semibold text-gray-900">{order.storeName}</span>
                        <span class="text-[#2b4b66] font-semibold">{order.status}</span>
                    </div>
                    <div class="flex items-center gap-8">
                        <img src={order.productImg} alt={order.productTitle} class="product-img-width product-img-height object-contain rounded-md border border-gray-100" />
                        <div class="flex-1 mt-2 mb-2">
                            <h3 class="font-semibold text-gray-900 mb-1">{order.productTitle}</h3>
                            <p class="text-gray-500 text-sm mb-1">Variation: {order.variation}</p>
                            <p class="text-gray-500 text-sm">x{order.qty}</p>
                        </div>
                        <div class="text-[#2b4b66] font-semibold text-lg ml-6">
                            ${order.price.toLocaleString()}
                        </div>
                    </div>
                    <div class="text-right mt-4 text-gray-900">
                        Order Total: <span class="text-[#2b4b66] text-xl font-bold ml-1">${order.orderTotal.toLocaleString()}</span>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<!-- Mobile Responsive Styles -->
<style>
    @media (max-width: 700px) {
        .sidebar-margin {
            margin-left: 0;
        }
        .content-padding {
            padding: 1rem 0.5rem;
        }
        .tab-gap {
            gap: 1rem;
        }
        .tab-text {
            font-size: 0.95rem;
        }
        .card-padding {
            padding: 0.7rem 0.5rem;
        }
        .product-img-width {
            width: 50px;
        }
        .product-img-height {
            height: 36px;
        }
    }
</style>