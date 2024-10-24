using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Business.Domain
{
	public class User
	{
		public Guid Id { get; set; }

		public string Name { get; set; }

		public ICollection<EventLog> LastEvents { get; set; }

		[NotMapped]
		public virtual EventLog LastEvent => LastEvents.FirstOrDefault();
	}
}
