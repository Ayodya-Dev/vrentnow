"use client";

import { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Pagination } from "@/components/data/pagination";
import { hasPermission, type Role } from "@/lib/permissions";
import {
  deleteInquiry,
  listInquiries,
  markInquiryRead,
  markInquiryUnread,
  type Inquiry,
} from "./api";

const ANY = "__any__";

export function InquiriesTable({ roles }: { roles: Role[] }) {
  const qc = useQueryClient();
  const canWrite = hasPermission(roles, "INQUIRIES_WRITE");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ANY);
  const [viewing, setViewing] = useState<Inquiry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Inquiry | null>(null);

  const query = {
    page,
    q: search.trim() || undefined,
    isRead: status === "read" ? true : status === "unread" ? false : undefined,
  };

  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["inquiries", query],
    queryFn: () => listInquiries(query),
    placeholderData: keepPreviousData,
  });

  async function run(
    action: () => Promise<unknown>,
    success?: string,
  ): Promise<void> {
    try {
      await action();
      if (success) toast.success(success);
      await qc.invalidateQueries({ queryKey: ["inquiries"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  function openInquiry(inquiry: Inquiry) {
    setViewing(inquiry);
    if (!inquiry.isRead && canWrite) {
      // Opening the message counts as reading it, like a mail client.
      void run(() => markInquiryRead(inquiry.id));
    }
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    const inquiry = confirmDelete;
    setConfirmDelete(null);
    await run(
      () => deleteInquiry(inquiry.id),
      `Deleted inquiry from ${inquiry.name}`,
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search name, email, or subject"
          value={search}
          aria-label="Search inquiries"
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v ?? ANY);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44" aria-label="Filter by read state">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any status</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : isError ? (
        <p className="text-destructive">Could not load inquiries.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No inquiries match that search.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((inquiry) => (
                  <TableRow
                    key={inquiry.id}
                    className="cursor-pointer"
                    onClick={() => openInquiry(inquiry)}
                  >
                    <TableCell>
                      {inquiry.isRead ? (
                        <Badge variant="secondary">Read</Badge>
                      ) : (
                        <Badge>Unread</Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={inquiry.isRead ? undefined : "font-semibold"}
                    >
                      <div>{inquiry.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {inquiry.email}
                      </div>
                    </TableCell>
                    <TableCell
                      className={
                        inquiry.isRead
                          ? "text-muted-foreground"
                          : "font-semibold"
                      }
                    >
                      {inquiry.subject ?? "(no subject)"}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {inquiry.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(inquiry.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {canWrite ? (
                        <div className="flex justify-end gap-2">
                          {inquiry.isRead ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                run(() => markInquiryUnread(inquiry.id))
                              }
                            >
                              Mark unread
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                run(() => markInquiryRead(inquiry.id))
                              }
                            >
                              Mark read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setConfirmDelete(inquiry)}
                          >
                            Delete
                          </Button>
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Pagination
            meta={data.meta}
            onPageChange={setPage}
            disabled={isFetching}
          />
        </>
      )}

      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.subject ?? "(no subject)"}</DialogTitle>
            <DialogDescription>
              From {viewing?.name} &lt;{viewing?.email}&gt;
              {viewing?.phone ? ` · ${viewing.phone}` : ""}
              {viewing
                ? ` · ${new Date(viewing.createdAt).toLocaleString()}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <p className="max-h-72 overflow-y-auto text-sm whitespace-pre-wrap">
            {viewing?.message}
          </p>
          <DialogFooter>
            {viewing ? (
              <Button
                variant="outline"
                render={
                  <a
                    href={`mailto:${viewing.email}?subject=${encodeURIComponent(
                      `Re: ${viewing.subject ?? "Your inquiry"}`,
                    )}`}
                  />
                }
              >
                Reply by email
              </Button>
            ) : null}
            <Button onClick={() => setViewing(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete inquiry from {confirmDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The message will be removed from the inbox. This cannot be undone
              from the admin console.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAction}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
