<script lang="ts">
  import { onMount } from 'svelte';
  import { admin } from '$lib/stores/admin';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  // Dashboard statistics
  let userStats = $state([
    { name: 'Total Users', value: '0', icon: 'users', color: 'bg-blue-500', href: '/page-admin/users' },
    { name: 'Customers', value: '0', icon: 'user', color: 'bg-green-500', href: '/page-admin/users' },
    { name: 'Sellers', value: '0', icon: 'store', color: 'bg-purple-500', href: '/page-admin/users' },
    { name: 'Admins', value: '0', icon: 'shield', color: 'bg-red-500', href: '/page-admin/users' }
  ]);

  let businessStats = $state([
    { name: 'Pending Approvals', value: '0', icon: 'clock', color: 'bg-yellow-500', href: '/page-admin/business' },
    { name: 'Approved Businesses', value: '0', icon: 'check', color: 'bg-green-500', href: '/page-admin/business' },
    { name: 'Rejected Businesses', value: '0', icon: 'x-mark', color: 'bg-red-500', href: '/page-admin/business' }
  ]);

  let reportStats = $state([
    { name: 'Pending Reports', value: '0', icon: 'exclamation', color: 'bg-yellow-500', href: '/page-admin/reports' },
    { name: 'Reviewed Reports', value: '0', icon: 'eye', color: 'bg-blue-500', href: '/page-admin/reports' },
    { name: 'Resolved Reports', value: '0', icon: 'check-circle', color: 'bg-green-500', href: '/page-admin/reports' }
  ]);

  // Recent activities
  let recentActivities = $state<any[]>([]);
  
  // Update stats whenever admin store changes
  $effect(() => {
    // Update user statistics
    if ($admin.users.length > 0) {
      userStats[0].value = $admin.users.length.toString();
      userStats[1].value = $admin.users.filter(user => user.role === 'customer').length.toString();
      userStats[2].value = $admin.users.filter(user => user.role === 'seller').length.toString();
      userStats[3].value = $admin.users.filter(user => user.role === 'admin').length.toString();
    }
    
    // Update business statistics
    if ($admin.pendingBusinesses.length > 0) {
      const pendingCount = $admin.pendingBusinesses.filter(b => !b.status || b.status === 'pending').length;
      const approvedCount = $admin.pendingBusinesses.filter(b => b.status === 'approved').length;
      const rejectedCount = $admin.pendingBusinesses.filter(b => b.status === 'rejected').length;
      
      businessStats[0].value = pendingCount.toString();
      businessStats[1].value = approvedCount.toString();
      businessStats[2].value = rejectedCount.toString();
    }
    
    // Update report statistics
    if ($admin.reports.length > 0) {
      const pendingCount = $admin.reports.filter(r => r.status === 'pending').length;
      const reviewedCount = $admin.reports.filter(r => r.status === 'reviewed').length;
      const resolvedCount = $admin.reports.filter(r => r.status === 'resolved').length;
      
      reportStats[0].value = pendingCount.toString();
      reportStats[1].value = reviewedCount.toString();
      reportStats[2].value = resolvedCount.toString();
    }
    
    // Generate recent activities from admin store data
    generateRecentActivities();
  });
  
  // Generate recent activities from admin store data
  function generateRecentActivities() {
    const activities = [];
    
    // Add recent business activities
    const businessActivities = $admin.pendingBusinesses
      .filter(business => business.status)
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 3)
      .map(business => ({
        id: `business-${business.id}`,
        type: 'business',
        title: business.status === 'approved' ? 'Business Approved' : 'Business Rejected',
        description: `${business.name} by ${business.user?.name || 'Unknown'}`,
        date: business.updated_at || business.created_at,
        status: business.status,
        icon: business.status === 'approved' ? 'check' : 'x-mark',
        color: business.status === 'approved' ? 'bg-green-500' : 'bg-red-500',
        href: '/page-admin/business'
      }));
    
    // Add recent report activities
    const reportActivities = $admin.reports
      .filter(report => report.status !== 'pending')
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 3)
      .map(report => ({
        id: `report-${report.id}`,
        type: 'report',
        title: report.status === 'resolved' ? 'Report Resolved' : 'Report Reviewed',
        description: `${report.reason} for item ${report.item?.name || 'Unknown'}`,
        date: report.updated_at || report.created_at,
        status: report.status,
        icon: report.status === 'resolved' ? 'check-circle' : 'eye',
        color: report.status === 'resolved' ? 'bg-green-500' : 'bg-blue-500',
        href: '/page-admin/reports'
      }));
    
    // Add recent user activities (newest users)
    const userActivities = $admin.users
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .map(user => ({
        id: `user-${user.id}`,
        type: 'user',
        title: 'New User Registered',
        description: `${user.name} (${user.role})`,
        date: user.created_at,
        status: 'new',
        icon: 'user-plus',
        color: 'bg-blue-500',
        href: '/page-admin/users'
      }));
    
    // Combine all activities and sort by date
    recentActivities = [...businessActivities, ...reportActivities, ...userActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }
  
  // Format date for display
  function formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  // Calculate time elapsed since date
  function timeAgo(dateString: string) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }

  // Fetch data on component mount
  onMount(() => {
    admin.loadUsers();
    admin.loadPendingBusinesses();
    admin.loadReports('all');
  });
</script>

<div class="min-h-screen bg-[#F5ECD5] pt-[1px]">
  <main class="flex-1 p-6 max-w-[calc(100vw-200px)]">
    <div class="max-w-7xl mx-auto">
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p class="mt-1 text-sm text-gray-600">Overview of your store management</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <p class="text-sm text-gray-600">
            <span class="font-medium">Today's Date:</span> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <!-- User Statistics -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">User Management</h2>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {#each userStats as stat}
            <div class="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
              <dt>
                <div class="{stat.color} absolute rounded-md p-3">
                  {#if stat.icon === 'users'}
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  {:else if stat.icon === 'user'}
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  {:else if stat.icon === 'store'}
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                    </svg>
                  {:else if stat.icon === 'shield'}
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  {/if}
                </div>
                <p class="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p class="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <div class="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                  <div class="text-sm">
                    <a href={stat.href} class="font-medium text-indigo-600 hover:text-indigo-500">View all<span class="sr-only"> {stat.name}</span></a>
                  </div>
                </div>
              </dd>
            </div>
          {/each}
        </div>
      </div>

      <!-- Business Statistics -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Business Approvals</h2>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {#each businessStats as stat}
            <div class="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
              <dt>
                <div class="{stat.color} absolute rounded-md p-3">
                  {#if stat.icon === 'clock'}
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  {:else if stat.icon === 'check'}
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  {:else if stat.icon === 'x-mark'}
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  {/if}
                </div>
                <p class="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p class="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <div class="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                  <div class="text-sm">
                    <a href={stat.href} class="font-medium text-indigo-600 hover:text-indigo-500">View all<span class="sr-only"> {stat.name}</span></a>
                  </div>
                </div>
              </dd>
            </div>
          {/each}
        </div>
      </div>

      <!-- Report Statistics -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Item Reports</h2>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {#each reportStats as stat}
            <div class="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
              <dt>
                <div class="{stat.color} absolute rounded-md p-3">
                  {#if stat.icon === 'exclamation'}
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  {:else if stat.icon === 'eye'}
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  {:else if stat.icon === 'check-circle'}
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  {/if}
                </div>
                <p class="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p class="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <div class="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                  <div class="text-sm">
                    <a href={stat.href} class="font-medium text-indigo-600 hover:text-indigo-500">View all<span class="sr-only"> {stat.name}</span></a>
                  </div>
                </div>
              </dd>
            </div>
          {/each}
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div class="overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            {#if recentActivities.length === 0}
              <li class="p-6">
                <p class="text-center text-gray-500">No recent activity</p>
              </li>
            {:else}
              {#each recentActivities as activity}
                <li>
                  <a href={activity.href} class="block hover:bg-gray-50">
                    <div class="flex items-center px-4 py-4 sm:px-6">
                      <div class="flex min-w-0 flex-1 items-center">
                        <div class="flex-shrink-0">
                          <div class="{activity.color} rounded-md p-2">
                            {#if activity.icon === 'check'}
                              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            {:else if activity.icon === 'x-mark'}
                              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            {:else if activity.icon === 'check-circle'}
                              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            {:else if activity.icon === 'eye'}
                              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            {:else if activity.icon === 'user-plus'}
                              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                              </svg>
                            {/if}
                          </div>
                        </div>
                        <div class="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                          <div>
                            <p class="truncate text-sm font-medium text-indigo-600">{activity.title}</p>
                            <p class="mt-1 truncate text-sm text-gray-500">{activity.description}</p>
                          </div>
                          <div class="hidden md:block">
                            <div>
                              <p class="text-sm text-gray-900">
                                {formatDate(activity.date)}
                              </p>
                              <p class="mt-1 text-sm text-gray-500">
                                {timeAgo(activity.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </a>
                </li>
              {/each}
            {/if}
          </ul>
        </div>
      </div>
    </div>
  </main>
</div>