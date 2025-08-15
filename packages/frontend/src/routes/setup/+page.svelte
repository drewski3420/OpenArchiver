<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { api } from '$lib/api.client';
	import { authStore } from '$lib/stores/auth.store';
	import { setAlert } from '$lib/components/custom/alert/alert-state.svelte';

	let first_name = '';
	let last_name = '';
	let email = '';
	let password = '';
	let isLoading = false;

	async function handleSubmit() {
		isLoading = true;
		try {
			const response = await api('/auth/setup', {
				method: 'POST',
				body: JSON.stringify({ first_name, last_name, email, password }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'An unknown error occurred.');
			}

			const { accessToken, user } = await response.json();
			authStore.login(accessToken, user);
			goto('/dashboard');
		} catch (err: any) {
			setAlert({
				type: 'error',
				title: 'Setup Failed',
				message: err.message,
				duration: 5000,
				show: true,
			});
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Setup - Open Archiver</title>
	<meta
		name="description"
		content="Set up the initial administrator account for Open Archiver."
	/>
</svelte:head>

<div
	class="flex min-h-screen flex-col items-center justify-center space-y-16 bg-gray-100 dark:bg-gray-900"
>
	<div>
		<a
			href="https://openarchiver.com/"
			target="_blank"
			class="flex flex-row items-center gap-2 font-bold"
		>
			<img src="/logos/logo-sq.svg" alt="OpenArchiver Logo" class="h-16 w-16" />
			<span class="text-2xl">Open Archiver</span>
		</a>
	</div>
	<Card.Root class="w-full max-w-md">
		<Card.Header class="space-y-1">
			<Card.Title class="text-2xl">Welcome</Card.Title>
			<Card.Description
				>Create the first administrator account to get started.</Card.Description
			>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<form on:submit|preventDefault={handleSubmit} class="grid gap-4">
				<div class="grid gap-2">
					<Label for="first_name">First name</Label>
					<Input
						id="first_name"
						type="text"
						placeholder="First name"
						bind:value={first_name}
						required
					/>
				</div>
				<div class="grid gap-2">
					<Label for="last_name">Last name</Label>
					<Input
						id="last_name"
						type="text"
						placeholder="Last name"
						bind:value={last_name}
						required
					/>
				</div>
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="m@example.com"
						bind:value={email}
						required
					/>
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input id="password" type="password" bind:value={password} required />
				</div>

				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						<span>Creating Account...</span>
					{:else}
						<span>Create Account</span>
					{/if}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
