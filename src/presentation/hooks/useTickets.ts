import { useState, useEffect } from 'react';
import { Ticket, TicketWithDetails, TicketAttachment, UpdateTicketDTO } from '@/domain/entities/Ticket';
import { TicketRepository } from '@/data/repositories/TicketRepository';

const ticketRepository = new TicketRepository();

/**
 * Hook to fetch and manage tickets list
 */
export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTickets = await ticketRepository.getAll();
      setTickets(fetchedTickets);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const refetch = () => {
    fetchTickets();
  };

  const deleteTicket = async (id: string) => {
    setLoading(true);
    try {
      await ticketRepository.delete(id);
      await fetchTickets();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (id: string, data: UpdateTicketDTO) => {
    setLoading(true);
    try {
      await ticketRepository.update(id, data);
      await fetchTickets();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    tickets, 
    loading, 
    error, 
    refetch, 
    deleteTicket,
    updateTicket
  };
}

/**
 * Hook to fetch a single ticket by ID with details
 */
export function useTicket(id: string) {
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTicket = async () => {
    if (!id) {
      setTicket(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedTicket = await ticketRepository.getByIdWithDetails(id);
      setTicket(fetchedTicket);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const closeTicket = async (resolution: string) => {
    if (!ticket) return;
    setLoading(true);
    try {
      const updatedTicket = await ticketRepository.closeTicket(ticket.id, resolution);
      await fetchTicket(); // Refetch to get updated details
      return updatedTicket;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignTicket = async (adminId: string) => {
    if (!ticket) return;
    setLoading(true);
    try {
      const updatedTicket = await ticketRepository.assignTicket(ticket.id, adminId);
      await fetchTicket();
      return updatedTicket;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchTicket();
  };

  return { ticket, loading, error, closeTicket, assignTicket, refetch };
}

/**
 * Hook to get tickets by contract
 */
export function useContractTickets(contractId: string) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!contractId) {
        setTickets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedTickets = await ticketRepository.getByContractId(contractId);
        setTickets(fetchedTickets);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [contractId]);

  return { tickets, loading, error };
}

/**
 * Hook to manage ticket attachments
 */
export function useTicketAttachments(ticketId: string) {
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [counts, setCounts] = useState({ documents: 0, photos: 0 });

  const fetchAttachments = async () => {
    if (!ticketId) {
      setAttachments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [fetchedAttachments, attachmentCounts] = await Promise.all([
        ticketRepository.getAttachments(ticketId),
        ticketRepository.countAttachmentsByType(ticketId),
      ]);
      setAttachments(fetchedAttachments);
      setCounts(attachmentCounts);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [ticketId]);

  const deleteAttachment = async (attachmentId: string) => {
    try {
      await ticketRepository.deleteAttachment(attachmentId);
      await fetchAttachments(); // Refetch to update list
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const canAddDocument = counts.documents < 1;
  const canAddPhoto = counts.photos < 3;

  return { 
    attachments, 
    loading, 
    error, 
    counts,
    canAddDocument,
    canAddPhoto,
    deleteAttachment,
    refetch: fetchAttachments 
  };
}

