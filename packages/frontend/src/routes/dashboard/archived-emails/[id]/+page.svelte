<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import EmailPreview from '$lib/components/custom/EmailPreview.svelte';
	import EmailThread from '$lib/components/custom/EmailThread.svelte';
	import { api } from '$lib/api.client';
	import { browser } from '$app/environment';
	import { formatBytes } from '$lib/utils';

	let { data }: { data: PageData } = $props();
	let email = $derived(data.email);

	async function download(path: string, filename: string) {
		if (!browser) return;

		try {
			const response = await api(`/storage/download?path=${encodeURIComponent(path)}`);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			a.remove();
		} catch (error) {
			console.error('Download failed:', error);
			// Optionally, show an error message to the user
		}
	}
</script>

{#if email}
	<div class="grid grid-cols-3 gap-6">
		<div class="col-span-3 md:col-span-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>{email.subject || 'No Subject'}</Card.Title>
					<Card.Description>
						From: {email.senderEmail || email.senderName} | Sent: {new Date(
							email.sentAt
						).toLocaleString()}
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="space-y-4">
						<div class="space-y-1">
							<h3 class="font-semibold">Recipients</h3>
							<Card.Description>
								<p>To: {email.recipients.map((r) => r.email || r.name).join(', ')}</p>
							</Card.Description>
						</div>
						<div class=" space-y-1">
							<h3 class="font-semibold">Meta data</h3>
							<Card.Description class="space-y-2">
								{#if email.path}
									<div class="flex flex-wrap items-center gap-2">
										<span>Folder:</span>
										<span class="  bg-muted truncate rounded p-1.5 text-xs"
											>{email.path || '/'}</span
										>
									</div>
								{/if}
								{#if email.tags && email.tags.length > 0}
									<div class="flex flex-wrap items-center gap-2">
										<span> Tags: </span>
										{#each email.tags as tag}
											<span class="  bg-muted truncate rounded p-1.5 text-xs">{tag}</span>
										{/each}
									</div>
								{/if}
								<div class="flex flex-wrap items-center gap-2">
									<span>size:</span>
									<span class="  bg-muted truncate rounded p-1.5 text-xs"
										>{formatBytes(email.sizeBytes)}</span
									>
								</div>
							</Card.Description>
						</div>
						<div>
							<h3 class="font-semibold">Email Preview</h3>
							<EmailPreview raw={email.raw} />
						</div>
						{#if email.attachments && email.attachments.length > 0}
							<div>
								<h3 class="font-semibold">Attachments</h3>
								<ul class="mt-2 space-y-2">
									{#each email.attachments as attachment}
										<li class="flex items-center justify-between rounded-md border p-2">
											<span>{attachment.filename} ({attachment.sizeBytes} bytes)</span>
											<Button
												variant="outline"
												size="sm"
												onclick={() => download(attachment.storagePath, attachment.filename)}
											>
												Download
											</Button>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
		<div class="col-span-3 space-y-6 md:col-span-1">
			<Card.Root>
				<Card.Header>
					<Card.Title>Actions</Card.Title>
				</Card.Header>
				<Card.Content>
					<Button onclick={() => download(email.storagePath, `${email.subject || 'email'}.eml`)}
						>Download Email (.eml)</Button
					>
				</Card.Content>
			</Card.Root>

			{#if email.thread && email.thread.length > 1}
				<Card.Root>
					<Card.Header>
						<Card.Title>Email thread</Card.Title>
					</Card.Header>
					<Card.Content>
						<EmailThread thread={email.thread} currentEmailId={email.id} />
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	</div>
{:else}
	<p>Email not found.</p>
{/if}
