# Checkpoint & Recovery Demo

This example demonstrates the power failure protection with automatic session
recovery.

## Purpose

The Checkpoint/Recovery feature provides:

1. Automatic session state preservation
2. Emergency save on interruption
3. Seamless session resumption
4. Backup rotation for data integrity

## Prerequisites

```bash
# Ensure CLI is installed
gemini --version

# Set API key
export GEMINI_API_KEY="your-api-key"
```

## Example 1: Enable Checkpointing

Start a session with checkpointing enabled:

```bash
gemini --checkpointing
```

### What Happens Automatically

```
🔄 Checkpointing Enabled
━━━━━━━━━━━━━━━━━━━━━━━━

✅ Auto-save interval: 5 minutes
✅ Emergency save: SIGINT, SIGTERM, SIGBREAK
✅ Backup location: ~/.gemini/checkpoints/
✅ Max backups: 10 (rotating)

> Starting new session...
> Session ID: sess_2026-01-07_21-33-32

[Your conversation continues...]

💾 Checkpoint saved (5:00 elapsed)
   └── ~/.gemini/checkpoints/sess_2026-01-07_21-33-32_001.json
```

## Example 2: Simulating Power Failure

### Step 1: Start a Long Session

```bash
gemini --checkpointing
> Analyze this large codebase and create documentation
```

### Step 2: Interrupt Mid-Session

Press `Ctrl+C` during execution:

```
^C
⚠️ Interrupt detected!
💾 Emergency checkpoint saved...
   └── Session state: 847 tokens processed
   └── Context preserved: 12 files analyzed
   └── Backup: sess_2026-01-07_21-33-32_emergency.json
✅ Safe to exit. Session can be recovered.
```

### Step 3: Resume Session

```bash
gemini --checkpointing
```

```
🔄 Previous session detected
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session: sess_2026-01-07_21-33-32
Last checkpoint: 2 minutes ago
Progress: 847/~2000 tokens (42%)
Context: 12 files analyzed

Resume this session? [Y/n]: Y

✅ Session restored
> Continuing analysis...
   └── Skipping already-processed files
   └── Resuming from: src/components/
```

## Example 3: Manual Checkpoint Management

### List Checkpoints

```bash
ls ~/.gemini/checkpoints/
```

```
sess_2026-01-05_14-22-10_001.json
sess_2026-01-05_14-22-10_002.json
sess_2026-01-07_21-33-32_001.json
sess_2026-01-07_21-33-32_emergency.json
```

### Checkpoint File Structure

```json
{
  "session_id": "sess_2026-01-07_21-33-32",
  "timestamp": "2026-01-07T21:38:32.000Z",
  "checkpoint_number": 1,
  "state": {
    "conversation_history": [...],
    "tokens_processed": 847,
    "files_analyzed": ["src/index.ts", "src/config.ts", ...],
    "current_task": "codebase_analysis",
    "progress": {
      "completed": ["parsing", "structure_analysis"],
      "pending": ["documentation", "summary"]
    }
  },
  "metadata": {
    "cli_version": "0.11.0",
    "model": "gemini-3.0-pro",
    "checkpoint_type": "automatic"
  }
}
```

## Example 4: Recovery Scenarios

### Scenario A: Clean Shutdown

```
# User exits normally
> /exit

💾 Final checkpoint saved
✅ Session ended cleanly
   └── Next time: Session will start fresh
```

### Scenario B: Power Failure

```
# Power loss during execution
[Connection lost]

# On next startup:
gemini --checkpointing

🔄 Incomplete session detected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Last known state: Emergency checkpoint
Reason: Unexpected termination
Data integrity: ✅ Verified (checksums match)

Recover? [Y/n]: Y
✅ Resuming from last known good state...
```

### Scenario C: Corrupted Checkpoint

```
gemini --checkpointing

⚠️ Checkpoint validation failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Primary: sess_xxx_003.json (corrupted)
Fallback: sess_xxx_002.json (valid, 5min older)

Use fallback? [Y/n]: Y
✅ Restored from backup checkpoint
```

## Backup Rotation

The system maintains up to 10 backups per session:

```
Checkpoint 1  ─┐
Checkpoint 2   │
Checkpoint 3   │ Oldest deleted when
Checkpoint 4   │ exceeding 10 backups
Checkpoint 5   │
...            │
Checkpoint 10 ─┘ Most recent
Emergency     ─── Always preserved until recovery
```

## Verification

To verify checkpoint integrity:

1. **Check file existence**: `ls ~/.gemini/checkpoints/`
2. **Validate JSON**: `cat <checkpoint> | jq .`
3. **Verify checksums**: Stored in metadata
4. **Test recovery**: Manually interrupt and resume

## Configuration Options

| Option                  | Default                | Description              |
| ----------------------- | ---------------------- | ------------------------ |
| `--checkpointing`       | disabled               | Enable checkpoint system |
| `--checkpoint-interval` | 5 min                  | Auto-save interval       |
| `--max-backups`         | 10                     | Maximum backup files     |
| `--checkpoint-dir`      | ~/.gemini/checkpoints/ | Storage location         |

## Troubleshooting

| Issue                  | Solution                                            |
| ---------------------- | --------------------------------------------------- |
| "Checkpoint too large" | Reduce context window or checkpoint more frequently |
| "Recovery failed"      | Use older backup with `--restore <file>`            |
| "Disk full"            | Clear old checkpoints or reduce max-backups         |
| "Permission denied"    | Check ~/.gemini/checkpoints/ permissions            |

## Security Considerations

- Checkpoints may contain conversation history
- Stored locally only (not transmitted)
- Consider encrypting for sensitive work
- Add to `.gitignore` if in project directories

## Related Commands

- `--checkpointing` - Enable during startup
- `/checkpoint save` - Manual checkpoint
- `/checkpoint list` - List available checkpoints
- `/checkpoint restore <id>` - Restore specific checkpoint
